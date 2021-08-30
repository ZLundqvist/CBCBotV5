import { getVoiceConnection } from '@discordjs/voice';
import Discord from 'discord.js';
import emojiCharacter from '../../constants/emoji-character';
import { CommandError } from '../../core/command-error';
import { Module } from "../../core/module";
import { Guild } from "../../database/entity/guild";
import getLogger from '../../utils/logger';
import memberStats from '../member-stats';
import { AudioResource, ParseResult, smartParse } from "./audio-resource-parser";
import { GuildQueue, GuildQueueItem } from "./guild-queue";

const log = getLogger(__dirname);

const VOLUME_FACTOR = 100;
const MAX_QUEUE_LENGTH = 200;

class Audio extends Module {
    private guildQueues: Set<GuildQueue>;

    constructor() {
        super('Audio');
        this.guildQueues = new Set();
    }

    async init(client: Discord.Client): Promise<void> {
        // No need to init
    }

    async playAndNotify(member: Discord.GuildMember, channel: Discord.TextChannel, resource: AudioResource) {

        const parseResults = await this.play(member, resource);

        if(parseResults.embed) {
            const embedMsg = await channel.send({ embeds: [parseResults.embed] });
            parseResults.item.notifyMsg = embedMsg;
            this.attachSkipReaction(parseResults.item.id, member, embedMsg);
        }
    }

    /**
     * Automatically queues and plays resouce in guild.
     * Returns the queued items
     * @param member 
     * @param resource 
     */
    async play(member: Discord.GuildMember, resource: AudioResource): Promise<ParseResult> {
        const guild = member.guild;
        const queue = this.getGuildQueue(guild);

        if(queue.length() >= MAX_QUEUE_LENGTH)
            throw new CommandError(`Queue cannot exceed ${MAX_QUEUE_LENGTH} items`);

        const parseResults = await smartParse(resource, member);
        queue.add(parseResults.item);

        log.trace(`Queued in guild ${member.guild.name}: ${parseResults.item.title}`);

        // Add to stats
        memberStats.incrementSongsQueued(member);

        // If connected but not playing, start
        if(getVoiceConnection(guild.id)) {
            this.playNext(guild);
        }

        return parseResults;
    }

    /**
     * If connected, check bitfield for speaking flag, otherwise false
     * @param guild 
     */
    isPlaying(guild: Discord.Guild): boolean {
        const vc = getVoiceConnection(guild.id);
        if(guild.voiceStates) {
            // return guild.voice.connection.speaking.has(Discord.Speaking.FLAGS.SPEAKING);
        }

        return false;
    }

    getQueue(guild: Discord.Guild): GuildQueueItem[] {
        return this.getGuildQueue(guild).getAll();
    }

    stop(guild: Discord.Guild) {
        const queue = this.getGuildQueue(guild);
        queue.clear();
        guild.voice?.connection?.dispatcher?.end();
    }

    reset(guild: Discord.Guild) {
        this.stop(guild);
        guild.voice?.connection?.disconnect();
    }

    clearQueue(guild: Discord.Guild) {
        this.getGuildQueue(guild).clear();
    }

    skip(guild: Discord.Guild) {
        guild.voice?.connection?.dispatcher?.end();
    }

    /**
     * Removes all items from queue that has the given id as parentId
     * If an item with the given id is currently playing, it's skipped
     * @param guild 
     * @param id 
     */
    skipById(guild: Discord.Guild, id: string) {
        const queue = this.getGuildQueue(guild);

        const current = queue.getFirst();
        if(current?.id === id) {
            // Currently playing song to be skipped
            // We just have to skip it
            this.skip(guild);
        } else {
            queue.removeById(id);
        }
    }

    async attachSkipReaction(itemId: string, author: Discord.GuildMember, embedMsg: Discord.Message) {
        if(!embedMsg.guild) {
            log.warn('Cannot attach skip reaction to embed message not sent in guild');
            return;
        }

        const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
            if(user.id !== author.user.id) return false;
            if(reaction.emoji.name !== emojiCharacter.reject) return false;

            return true;
        };

        const collector = embedMsg.createReactionCollector(filter, { max: 1 });
        collector.once('collect', async () => {
            this.skipById(author.guild, itemId);
            this.removeSkipReaction(embedMsg);
        });

        await embedMsg.react(emojiCharacter.reject);
    }

    async removeSkipReaction(embedMsg: Discord.Message) {
        // Update msg state
        const updated = await embedMsg.fetch();
        await updated.reactions.removeAll();
    }

    private async playNext(guild: Discord.Guild) {
        if(!guild.voice?.connection) {
            return;
        }
        const queue = this.getGuildQueue(guild);
        const next = queue.getFirst();

        if(next) {
            log.info(`Playing in guild ${guild.name}: ${next.title}`);

            const volume = await this.getVolume(guild) / VOLUME_FACTOR;
            const dispatcher = await next.play(guild.voice.connection);
            dispatcher.setVolume(volume);

            dispatcher.on('error', (e) => {
                log.error(e);
            });

            dispatcher.on('finish', () => {
                if(next.notifyMsg)
                    this.removeSkipReaction(next.notifyMsg);

                queue.removeFirst();
                if(queue.length() > 0) {
                    setTimeout(() => {
                        this.playNext(guild);
                    }, 1250);
                }
            });
        }
    }

    async setVolume(guild: Discord.Guild, volume: number): Promise<void> {
        if(guild.voice?.connection?.dispatcher) {
            guild.voice.connection.dispatcher.setVolume(volume / VOLUME_FACTOR);
        }

        const g = await Guild.findOneOrFail(guild.id);
        g.volume = volume;
        await g.save();
    }

    async getVolume(guild: Discord.Guild): Promise<number> {
        const g = await Guild.findOneOrFail(guild.id);
        return g.volume;
    }

    private getGuildQueue(guild: Discord.Guild): GuildQueue {
        let queue = Array.from(this.guildQueues.values()).find(g => g.guildID === guild.id);

        if(!queue) {
            queue = new GuildQueue(guild);
            this.guildQueues.add(queue);
            log.debug(`Created GuildQueue: ${guild.name}`);
        }

        return queue;
    }
}

export default new Audio();
