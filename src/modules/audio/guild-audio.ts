import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, demuxProbe, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnectionStatus } from '@discordjs/voice';
import Discord from 'discord.js';
import { Logger } from 'log4js';
import { EmojiCharacters } from '../../constants';
import { CommandError } from '../../core';
import { DBGuildUtils } from '../../database/entity/guild';
import { DBQueueHistoryUtils } from '../../database/entity/queue-history';
import getLogger from '../../utils/logger';
import memberStats from '../member-stats';
import * as EmbedGenerators from './embed-generator';
import { GuildQueue } from './guild-queue';
import { GuildQueueItem } from './guild-queue-item';
import { smartParse } from './smart-parse';

const MAX_QUEUE_LENGTH = 50;

export class GuildAudio {
    private log: Logger;
    private _guild: Discord.Guild;;
    private _player: AudioPlayer;
    private _queue: GuildQueue;

    constructor(guild: Discord.Guild) {
        this.log = getLogger(`GuildAudio (${guild.name})`);
        this._guild = guild;
        this._queue = new GuildQueue();
        this._player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Stop // Stop player when there are no active subscription-listeneres
            }
        });

        this._player.on('stateChange', (oldState, newState) => {
            this.log.trace(`AudioPlayer stateChange: ${oldState.status} -> ${newState.status}`);

            if(newState.status === AudioPlayerStatus.Idle) {
                this.onPlayingEnd();
            }
        });

        this._player.on('error', (e) => {
            this.log.error('AudioPlayer error:');
            this.log.error(e);
        });
    }

    async queue(member: Discord.GuildMember, query: string, generateEmbed: boolean, track: boolean): Promise<GuildQueueItem> {
        if(this._queue.size >= MAX_QUEUE_LENGTH)
            throw new CommandError(`Queue cannot exceed ${MAX_QUEUE_LENGTH} items`);

        const guildQueueItem = await smartParse(member, query, generateEmbed, this._queue.size);
        this._queue.add(guildQueueItem);
        this.log.debug(`Queued: ${guildQueueItem.title}`);

        if(track) {
            await memberStats.incrementSongsQueued(member);
            await DBQueueHistoryUtils.addGuildQueueItemToQueueHistory(member.guild, guildQueueItem);
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
        const item = this._queue.pop();

        if(item) {
            if(item.embedMsg) {
                this.removeSkipReaction(item.embedMsg);
            }

            this.log.debug(`Finished: ${item?.title} (remaining queue: ${this._queue.size})`);
        }

        this.playNext();
    }

    async playNext() {
        const vc = getVoiceConnection(this._guild.id);
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


        const next = this._queue.peek();
        if(next) {
            // Get volume 
            const volume = (await DBGuildUtils.getGuild(this._guild)).volume;

            // Subscribe VC to player
            vc.subscribe(this._player);

            // Create AudioResource
            const readable = next.createReadable();
            const { stream, type } = await demuxProbe(readable);
            const resource = createAudioResource(stream, { inputType: type, inlineVolume: true });

            // Set Volume
            resource.volume?.setVolume(volume / 100);

            this._player.play(resource);
            this.log.info(`Playing: ${next.title} (type: ${type})`);
        }
    }

    async removeSkipReaction(embedMsg: Discord.Message) {
        // Update msg state
        const updated = await embedMsg.fetch();
        await updated.reactions.removeAll();
    }

    /**
     * Checks if currently playing or buffering the resource
     * @param guild 
     */
    get isPlaying(): boolean {
        return this._player.state.status !== AudioPlayerStatus.Idle;
    }

    stop() {
        this.clearQueue();
        this._player.stop();
        this.log.debug('Stopped');
    }

    clearQueue() {
        this._queue.clear();
        this.log.debug('Queue cleared');
    }


    skipById(id: string) {
        const currentItem = this._queue.peek();
        const itemToSkip = this._queue.getById(id);

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
            this._queue.removeById(itemToSkip.id);
            this.log.debug(`Skipped: ${itemToSkip.title}`);
        }
    }

    /**
     * Skip current item
     */
    skipCurrent() {
        const itemToSkip = this._queue.peek();

        if(!itemToSkip) {
            this.log.debug('skipCurrent called with empty queue');
            return;
        }

        this._player.stop();
        this.log.debug(`Skipped: ${itemToSkip.title}`);
    }

    async attachSkipReaction(item: GuildQueueItem) {
        const msg = await item.fetchEmbedMessage();

        if(!msg) {
            this.log.warn('attachSkipReaction was passed GuildQueueItem without embedMsg');
            return;
        }

        // Filter that only allows the user that queued the item to pass
        const queuedByFilter = (reaction: Discord.MessageReaction, user: Discord.User) => {
            if(user.id !== item.queuedByUserId) return false;
            if(reaction.emoji.name !== EmojiCharacters.reject) return false;

            return true;
        };

        const onCollected = () => {
            this.skipById(item.id);
            this.removeSkipReaction(msg);
        };

        msg.createReactionCollector({
            filter: queuedByFilter,
            max: 1
        }).once('collect', onCollected);

        await msg.react(EmojiCharacters.reject);
    }

    getQueueEmbed() {
        return EmbedGenerators.getQueueEmbed(this._guild, this._queue.getQueue());
    }

    getCurrentAudioResource(): AudioResource | undefined {
        return this._player.state.status === AudioPlayerStatus.Idle ? undefined : this._player.state.resource;
    }

    async getVolume(): Promise<number> {
        const guild = await DBGuildUtils.getGuild(this._guild);
        return guild.volume;
    }

    async setVolume(v: number) {
        const guild = await DBGuildUtils.getGuild(this._guild);
        guild.volume = v;
        await guild.save();

        // Update current playing volume if playing
        const resource = this.getCurrentAudioResource();
        if(resource) {
            if(resource.volume) {
                resource.volume.setVolume(v / 100);
                this.log.debug(`Volume set: ${v}%`);
            } else {
                this.log.warn(`setVolume called on resource without`);
            }
        }
    }
}
