import Discord from 'discord.js';
import { nanoid } from 'nanoid';
import { Readable } from 'stream';
import { AudioProvider } from '../../constants';

/**
 * Data class that stores info about a queued item 
 */
export class GuildQueueItem {
    id: string;

    title: string;
    /**
     * The id of the Discord.User who queued the item
     */
    queuedBy: Discord.GuildMember;
    provider: AudioProvider;
    initialQueuePosition: number;

    createReadable: () => Readable;

    length: number | undefined;
    thumbnail: string | undefined;
    link: string | undefined;

    embed: Discord.MessageEmbed | undefined;
    embedMsg: Discord.Message | undefined;

    constructor(title: string, queuedBy: Discord.GuildMember, createReadable: () => Readable, provider: AudioProvider, initialQueuePosition: number) {
        this.id = nanoid();
        this.title = title;
        this.queuedBy = queuedBy;
        this.createReadable = createReadable;
        this.provider = provider;
        this.initialQueuePosition = initialQueuePosition;
    }

    /**
     * Set the length of in seconds
     * @param length 
     * @returns 
     */
    setLength(length: number) {
        this.length = length;
        return this;
    }

    /**
     * Set the url to the thumbnail
     * @param thumbnail 
     * @returns 
     */
    setThumbnail(thumbnail: string) {
        this.thumbnail = thumbnail;
        return this;
    }

    /**
     * Set the link to the resource. Included in embed.
     * @param link 
     * @returns 
     */
    setLink(link: string) {
        this.link = link;
        return this;
    }

    /**
     * Set the message that was sent with an embed
     * @param embedMsgId
     * @returns 
     */
    setEmbedMessage(embedMsg: Discord.Message) {
        this.embedMsg = embedMsg;
        return this;
    }

    /**
     * Update the message using the Discord API and return it
     * @returns 
     */
    async fetchEmbedMessage() {
        if(this.embedMsg) {
            this.embedMsg = await this.embedMsg.fetch();
            return this.embedMsg;
        }
    }
}

