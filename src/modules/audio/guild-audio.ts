import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, demuxProbe, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnectionStatus } from '@discordjs/voice';
import Discord from 'discord.js';
import { Logger } from 'log4js';
import { EmojiCharacters } from '../../constants';
import { BotCore, CommandError } from '../../core';
import getLogger from '../../utils/logger';
import memberStats from '../member-stats';
import { GuildQueue } from './guild-queue';
import { GuildQueueItem } from './guild-queue-item/guild-queue-item';
import { smartParse } from './smart-parse';

const MAX_QUEUE_LENGTH = 50;
const VOLUME_FACTOR = 200;

export class GuildAudio {
    private readonly log: Logger;
    private readonly guild: Discord.Guild;
    private readonly player: AudioPlayer;
    private readonly queue: GuildQueue;

    constructor(guild: Discord.Guild) {
        this.log = getLogger(`guild-audio (${guild.name})`);
        this.guild = guild;
        this.queue = new GuildQueue(guild);
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Stop // Stop player when there are no active subscription-listeneres
            }
        });

        this.player.on('stateChange', (oldState, newState) => {
            this.log.trace(`AudioPlayer stateChange: ${oldState.status} -> ${newState.status}`);

            if(newState.status === AudioPlayerStatus.Idle) {
                this.onPlayingEnd();
            }
        });

        this.player.on('error', (e) => {
            this.log.error(e);
        });
    }

    async smartQueue(query: string, queuedBy: Discord.GuildMember, addToHistory: boolean): Promise<GuildQueueItem> {
        if(this.queue.size >= MAX_QUEUE_LENGTH)
            throw new CommandError(`Queue cannot exceed ${MAX_QUEUE_LENGTH} items`);

        const guildQueueItem = await smartParse(query, queuedBy, this.queue.size);
        const trackInfo = await guildQueueItem.getTrackInfo();
        this.queue.add(guildQueueItem);
        this.log.debug(`Queued: ${trackInfo.title}`);

        if(addToHistory) {
            await memberStats.incrementSongsQueued(queuedBy);
            await BotCore.database.addGuildQueueItemToQueueHistory(queuedBy.guild, trackInfo.title, trackInfo.queuedBy.user);
        }

        if(!this.isPlaying) {
            this.playNext();
        }

        return guildQueueItem;
    }

    /**
     * Gets called when the AudioPlayer stops playing an AudioResource
     */
    private onPlayingEnd() {
        // Remove first item in queue
        const item = this.queue.pop();

        if(item) {
            this.removeSkipReactions(item);
            this.log.debug(`Finished: ${item.id} (remaining queue: ${this.queue.size})`);
        }

        this.playNext();
    }

    async playNext() {
        const vc = getVoiceConnection(this.guild.id);
        if(!vc) {
            this.log.debug('playNext called without VoiceConnection');
            this.clearQueue();
            return;
        }

        try {
            await entersState(vc, VoiceConnectionStatus.Ready, 5000);
        } catch {
            this.clearQueue();
            this.log.warn('Waited 5s for VoiceConnection to become ready, playNext aborted');
            return;
        }


        const next = this.queue.peek();
        if(next) {
            const trackInfo = await next.getTrackInfo();

            // Get volume 
            const volume = (await BotCore.database.getGuild(this.guild)).volume;

            // Subscribe VC to player
            vc.subscribe(this.player);

            // Create AudioResource
            const { stream, type } = await demuxProbe(await next.getReadable());
            const resource = createAudioResource(stream, { inputType: type, inlineVolume: true });

            // Set Volume
            resource.volume?.setVolume(volume / VOLUME_FACTOR);

            this.player.play(resource);
            this.log.info(`Playing: ${trackInfo.title} (id: ${next.id}, type: ${type})`);
        }
    }

    async removeSkipReactions(item: GuildQueueItem) {
        const embedMsg = await item.getEmbedMessage();
        if(embedMsg) {
            await embedMsg.reactions.removeAll();
        }
    }

    /**
     * Checks if currently playing or buffering the resource
     * @param guild 
     */
    get isPlaying(): boolean {
        return this.player.state.status !== AudioPlayerStatus.Idle;
    }

    stop() {
        this.clearQueue();
        this.player.stop();
        this.log.debug('Stop');
    }

    clearQueue() {
        this.queue.clear();
        this.log.debug('Queue cleared');
    }


    skipById(id: string) {
        const currentItem = this.queue.peek();
        const itemToSkip = this.queue.getById(id);

        if(!currentItem) {
            this.log.debug(`skipById with empty queue: ${id}`);
            return;
        }

        if(!itemToSkip) {
            this.log.debug(`skipById passed non-existing id: ${id}`);
            return;
        }

        if(currentItem.id === itemToSkip.id) {
            this.skipCurrent();
        } else {
            this.queue.removeById(itemToSkip.id);
            this.log.debug(`Skipped: ${itemToSkip.id}`);
        }
    }

    /**
     * Skip current item
     */
    skipCurrent() {
        const itemToSkip = this.queue.peek();

        if(!itemToSkip) {
            this.log.debug('skipCurrent called with empty queue');
            return;
        }

        this.player.stop();
        this.log.debug(`Skipped: ${itemToSkip.id}`);
    }

    async attachSkipReaction(item: GuildQueueItem) {
        const trackInfo = await item.getTrackInfo();
        const msg = await item.getEmbedMessage();

        if(!msg) {
            this.log.warn('attachSkipReaction was passed GuildQueueItem without embedMsg');
            return;
        }

        // Filter that only allows the user that queued the item to pass
        const queuedByFilter = (reaction: Discord.MessageReaction, user: Discord.User) => {
            if(user.id !== trackInfo.queuedBy.user.id) return false;
            if(reaction.emoji.name !== EmojiCharacters.reject) return false;

            return true;
        };

        const onCollected = () => {
            this.skipById(item.id);
            this.removeSkipReactions(item);
        };

        msg.createReactionCollector({
            filter: queuedByFilter,
            max: 1
        }).once('collect', onCollected);

        await msg.react(EmojiCharacters.reject);
    }

    async getQueueEmbed(): Promise<Discord.MessageEmbed> {
        return await this.queue.getMessageEmbed();
    }

    getCurrentAudioResource(): AudioResource | undefined {
        return this.player.state.status === AudioPlayerStatus.Idle ? undefined : this.player.state.resource;
    }

    async getVolume(): Promise<number> {
        const guild = await BotCore.database.getGuild(this.guild);
        return guild.volume;
    }

    async setVolume(v: number) {
        const guild = await BotCore.database.getGuild(this.guild);
        guild.volume = v;
        await guild.save();

        // Update current playing volume if playing
        const resource = this.getCurrentAudioResource();
        if(resource) {
            if(resource.volume) {
                resource.volume.setVolume(v / VOLUME_FACTOR);
                this.log.debug(`Volume set: ${v}%`);
            } else {
                this.log.warn(`setVolume called on resource without`);
            }
        }
    }
}
