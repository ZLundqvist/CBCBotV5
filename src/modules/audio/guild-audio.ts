import { EmojiCharacters } from '@constants';
import { CommandError } from '@core';
import { DBQueueHistoryUtils } from '@db/queue-history';
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnectionStatus } from '@discordjs/voice';
import memberStats from '@modules/member-stats';
import Discord from 'discord.js';
import { Logger } from 'log4js';
import getLogger from '../../utils/logger';
import { smartParse } from './audio-resource-parser';
import * as EmbedGenerators from './embed-generator';
import { GuildQueue } from './guild-queue';
import { GuildQueueItem } from './guild-queue-item';

const VOLUME_FACTOR = 100;
const MAX_QUEUE_LENGTH = 50;

type QueueOptions = {
    member: Discord.GuildMember;
    input: string;
    embed: {

    } | undefined;
};

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
                noSubscriber: NoSubscriberBehavior.Stop
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

    onPlayingEnd() {
        const item = this._queue.pop();

        if(item && item.embedMsg) {
            this.removeSkipReaction(item.embedMsg);
        }

        this.log.debug(`Finished: ${item?.title} (queue size: ${this._queue.size})`);
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
            this.log.warn('Waited 5s for VoiceConnection to become ready, playNext aborted.');
            return;
        }
        

        const next = this._queue.peek();
        if(next) {
            this.log.info(`Playing: ${next.title}`);
            vc.subscribe(this._player);
            this._player.play(next.createAudioResource());
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
            this.log.debug('skip called with empty queue');
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

    // TODO: Implement volume
    getVolume(): number {
        return 100;
    }

    setVolume(v: number) {

    }
}
