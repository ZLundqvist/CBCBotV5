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
    public readonly provider: AudioProvider;

    protected readonly queuedBy: Discord.GuildMember;
    protected readonly initialQueuePosition: number;

    private embedMessage?: Discord.Message;

    constructor(provider: AudioProvider, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        this.id = nanoid();
        this.provider = provider;
        this.queuedBy = queuedBy;
        this.initialQueuePosition = initialQueuePosition;
    }

    abstract getTrackInfo(): Promise<TrackInfo>;
    abstract getReadable(): Promise<Readable>;

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
        const info = await this.getTrackInfo();

        const emoji = resolveEmojiString(this.provider.emoji, this.queuedBy.guild);

        const embed = new Discord.MessageEmbed()
            .setColor(this.provider.color);

        if(info.link) {
            embed.setAuthor(info.title, undefined, info.link);
            embed.setTitle(`${emoji} ${info.link}`);
        } else {
            embed.setTitle(`${emoji} ${info.title}`);
        }
        if(info.thumbnail) embed.setThumbnail(info.thumbnail);
        if(info.link) embed.setURL(info.link);

        if(info.length) {
            embed.addField('Length', secondsToMS(info.length), true);
        }

        if(this.initialQueuePosition >= 1) {
            embed.addField('Position', `#${this.initialQueuePosition}`, true);
        }

        embed.setFooter(`Skip using the ${EmojiCharacters.reject} reaction`);
        return embed;
    }
}
