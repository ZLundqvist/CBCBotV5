import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice';
import Discord, { MessageEmbed } from 'discord.js';
import { nanoid } from 'nanoid';
import { Readable } from 'stream';
import { AudioProvider, EmojiCharacters } from '../../../constants';
import { resolveEmojiString } from '../../../utils/emoji';
import { secondsToMS } from '../../../utils/time';

export type TrackInfo = {
    title: string;
    queuedBy: Discord.GuildMember;
    initialQueuePosition: number
    /**
     * Length in seconds
     */
    length?: number;
    link?: string;
    thumbnail?: string;
};

export abstract class GuildQueueItem {
    public readonly id: string;

    private embedMessage?: Discord.Message;
    private audioResource?: AudioResource<TrackInfo>;

    constructor(readonly provider: AudioProvider, private readonly stream: Readable, readonly trackInfo: TrackInfo) {
        this.id = nanoid();
    }

    async getAudioResource(): Promise<AudioResource<TrackInfo>> {
        const probe = await demuxProbe(this.stream);
        this.audioResource = createAudioResource(probe.stream, { inputType: probe.type, inlineVolume: true, metadata: this.trackInfo });
        return this.audioResource;
    }

    /**
     * @returns Whether this resource has started playing.
     */
    hasStarted(): boolean {
        return !!(this.audioResource && this.audioResource.started);
    }

    /**
     * @returns How long this resource has been playing for, in milliseconds
     */
    getPlaybackDuration(): number | undefined {
        return this.audioResource?.playbackDuration;
    }

    setEmbedMessage(embedMessage: Discord.Message): void {
        if(this.embedMessage) {
            throw new Error(`EmbedMessage has already been set (id: ${this.id})`);
        }
        this.embedMessage = embedMessage;
    }

    async getEmbedMessage(): Promise<Discord.Message | undefined> {
        if(this.embedMessage) {
            return await this.embedMessage.fetch();
        }
    }

    async getMessageEmbed(): Promise<MessageEmbed> {
        const emoji = resolveEmojiString(this.provider.emoji, this.trackInfo.queuedBy.guild);

        const embed = new Discord.MessageEmbed()
            .setColor(this.provider.color);

        if(this.trackInfo.link) {
            embed.setAuthor(this.trackInfo.title, undefined, this.trackInfo.link);
            embed.setTitle(`${emoji} ${this.trackInfo.link}`);
        } else {
            embed.setTitle(`${emoji} ${this.trackInfo.title}`);
        }
        if(this.trackInfo.thumbnail) embed.setThumbnail(this.trackInfo.thumbnail);
        if(this.trackInfo.link) embed.setURL(this.trackInfo.link);

        if(this.trackInfo.length) {
            embed.addField('Length', secondsToMS(this.trackInfo.length), true);
        }

        if(this.trackInfo.initialQueuePosition >= 1) {
            embed.addField('Position', `#${this.trackInfo.initialQueuePosition}`, true);
        }

        embed.setFooter(`Skip using the ${EmojiCharacters.reject} reaction`);
        return embed;
    }
}
