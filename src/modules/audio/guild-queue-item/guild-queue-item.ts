import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice';
import Discord from 'discord.js';
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

export type ReadableCreator = () => Promise<Readable>;

export abstract class GuildQueueItem {
    public readonly id: string;

    readonly provider: AudioProvider;
    readonly trackInfo: TrackInfo;

    protected embedMessage?: Discord.Message;
    protected createReadable: ReadableCreator;
    protected audioResource?: AudioResource<TrackInfo>;

    constructor(provider: AudioProvider, trackInfo: TrackInfo, createReadable: ReadableCreator) {
        this.id = nanoid();
        this.provider = provider;
        this.trackInfo = trackInfo;
        this.createReadable = createReadable;
    }

    async getAudioResource(): Promise<AudioResource<TrackInfo>> {
        const stream = await this.createReadable();
        const probe = await demuxProbe(stream);
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

    async removeEmbedReactions(): Promise<void> {
        const embedMsg = await this.getEmbedMessage();
        if(embedMsg) {
            await embedMsg.reactions.removeAll();
        }
    }

    getMessageEmbed(): Discord.MessageEmbed {
        const emoji = resolveEmojiString(this.provider.emoji, this.trackInfo.queuedBy.guild);

        const embed = new Discord.MessageEmbed()
            .setColor(this.provider.color)
            .setFooter({ text: `Skip using the ${EmojiCharacters.reject} reaction` });

        if(this.trackInfo.link) {
            embed.setAuthor({
                name: this.trackInfo.title,
                iconURL: undefined,
                url: this.trackInfo.link
            });
            embed.setTitle(`${emoji} ${this.trackInfo.link}`);
        } else {
            embed.setTitle(`${emoji} ${this.trackInfo.title}`);
        }

        if(this.trackInfo.thumbnail) {
            embed.setThumbnail(this.trackInfo.thumbnail);
        }

        if(this.trackInfo.link) {
            embed.setURL(this.trackInfo.link);
        }

        if(this.trackInfo.length) {
            embed.addField('Length', secondsToMS(this.trackInfo.length), true);
        }

        if(this.trackInfo.initialQueuePosition >= 1) {
            embed.addField('Position', `#${this.trackInfo.initialQueuePosition}`, true);
        }

        return embed;
    }
}
