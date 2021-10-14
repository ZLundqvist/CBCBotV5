import Discord from 'discord.js';
import { nanoid } from 'nanoid';
import { Readable } from 'stream';
import { AudioProvider } from '../../../constants';

export type TrackInfo = {
    title: string;
    queuedBy: Discord.GuildMember;
    initialQueuePosition: number
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
    abstract getMessageEmbed(): Promise<Discord.MessageEmbed>;

    setEmbedMessage(embedMessage: Discord.Message): void {
        this.embedMessage = embedMessage;
    }

    async getEmbedMessage(): Promise<Discord.Message | undefined> {
        if(this.embedMessage) {
            return await this.embedMessage.fetch();
        }
    }
}
