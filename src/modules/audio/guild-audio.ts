import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnectionStatus } from '@discordjs/voice';
import Discord from 'discord.js';
import { EmojiCharacters } from '../../constants';
import { BotCore, CommandError } from '../../core';
import { getLoggerWrapper, LoggerWrapper } from '../../utils/logger';
import memberStats from '../member-stats';
import { GuildQueue } from './guild-queue';
import { GuildQueueItem, TrackInfo } from './guild-queue-item/guild-queue-item';
import { smartParse } from './smart-parse';

const MAX_QUEUE_LENGTH = 50;
const VOLUME_FACTOR = 200;

export class GuildAudio {
    private readonly log: LoggerWrapper;
    private readonly guild: Discord.Guild;
    private readonly player: AudioPlayer;
    private readonly queue: GuildQueue;

    constructor(guild: Discord.Guild) {
        this.log = getLoggerWrapper(`guild-audio (${guild.name})`);
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
        this.queue.add(guildQueueItem);
        this.log.debug(`Queued: ${guildQueueItem.trackInfo.title} (id: ${guildQueueItem.id})`);

        if(addToHistory) {
            await memberStats.incrementSongsQueued(queuedBy);
            await BotCore.database.addGuildQueueItemToQueueHistory(queuedBy.guild, guildQueueItem.trackInfo.title, guildQueueItem.trackInfo.queuedBy.user);
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
            item.removeEmbedReactions();
            this.log.debug(`Finished: ${item.trackInfo.title} (id: ${item.id}, remaining queue: ${this.queue.size})`);
        }

        this.playNext();
    }

    private async playNext() {
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
            // Get volume 
            const volume = (await BotCore.database.getGuild(this.guild)).volume;

            // Subscribe VC to player
            vc.subscribe(this.player);

            // Create AudioResource
            const resource = await next.getAudioResource();

            // Set Volume
            resource.volume?.setVolume(volume / VOLUME_FACTOR);

            this.player.play(resource);
            this.log.info(`Playing: ${next.trackInfo.title} (id: ${next.id})`);
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
            this.log.debug(`Skipped: ${itemToSkip.trackInfo.title} (id: ${itemToSkip.id})`);
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
        this.log.debug(`Skipped: ${itemToSkip.trackInfo.title} (id: ${itemToSkip.id})`);
    }

    async attachSkipReaction(item: GuildQueueItem) {
        const msg = await item.getEmbedMessage();

        if(!msg) {
            this.log.warn('attachSkipReaction was passed GuildQueueItem without embedMsg');
            return;
        }

        // Filter that only allows the user that queued the item to pass
        const queuedByFilter = (reaction: Discord.MessageReaction, user: Discord.User) => {
            if(user.id !== item.trackInfo.queuedBy.user.id) return false;
            if(reaction.emoji.name !== EmojiCharacters.reject) return false;

            return true;
        };

        msg.createReactionCollector({
            filter: queuedByFilter,
            max: 1
        }).once('collect', () => {
            item.removeEmbedReactions();
            this.skipById(item.id);
        });

        await msg.react(EmojiCharacters.reject);
    }

    async getQueueEmbed(): Promise<Discord.MessageEmbed> {
        return await this.queue.getMessageEmbed();
    }

    getCurrentAudioResource(): AudioResource<TrackInfo> | undefined {
        return this.player.state.status === AudioPlayerStatus.Idle ? undefined : this.player.state.resource as AudioResource<TrackInfo>;
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
        if(resource && resource.volume) {
            resource.volume.setVolume(v / VOLUME_FACTOR);
            this.log.debug(`Volume set: ${v}%`);
        }
    }
}
