import Discord from 'discord.js';
import { Colors } from '../../constants';
import { resolveEmojiString } from '../../utils/emoji';
import { secondsToMS } from '../../utils/time';
import { GuildQueueItem, TrackInfo } from './guild-queue-item/guild-queue-item';

const QUEUE_EMBED_ITEMS_LIMIT = 10;

export class GuildQueue {
    private readonly guild: Discord.Guild;
    private queue: GuildQueueItem[];

    constructor(guild: Discord.Guild) {
        this.guild = guild;
        this.queue = [];
    }

    get size(): number {
        return this.queue.length;
    }

    getQueue(): GuildQueueItem[] {
        return this.queue;
    }

    /**
     * Add item to queue.
     * Returns the queued items position in queue.
     * @param items 
     */
    add(item: GuildQueueItem): number {
        return this.queue.push(item);
    }

    /** Clears queue */
    clear(): void {
        this.queue = [];
    }

    /**
     * Removes and returns first item in queue
     * Returns undefined if queue is empty
     */
    pop(): GuildQueueItem | undefined {
        return this.queue.shift();
    }

    /**
     * Returns first item in queue without removing it (or undefined if empty queue)
     */
    peek(): GuildQueueItem | undefined {
        return this.queue[0];
    }

    getById(id: string): GuildQueueItem | undefined {
        return this.queue.find(item => item.id === id);
    }

    /**
     * Removes the item with the given id
     * Returns true if the id was removed from the queue, false otherwise
     * @param id 
     */
    removeById(id: string): boolean {
        const beforeSize = this.size;
        this.queue = this.queue.filter(item => item.id !== id);
        return beforeSize !== this.size; // Return true if size has changed after filtering
    }

    async getMessageEmbed(): Promise<Discord.MessageEmbed> {
        const fields: Discord.EmbedField[] = [];
        const embed = new Discord.MessageEmbed();

        const totalQueueTime = this.queue.reduce((acc, cur) => acc += cur.trackInfo.length ? cur.trackInfo.length : 0, 0);

        this.queue.slice(0, QUEUE_EMBED_ITEMS_LIMIT).forEach((item, index) => {
            const emoji = resolveEmojiString(item.provider.emoji, this.guild);
            let upperField = `#${index + 1}`;
            if(index === 0) {
                upperField = 'Current';
                let lowerField = `${emoji} ${item.trackInfo.title} `;
                lowerField += item.trackInfo.length ? `[${secondsToMS(item.trackInfo.length)}] ` : '';
                lowerField += `(${item.trackInfo.queuedBy.displayName})`;

                fields.push({
                    name: upperField,
                    value: lowerField,
                    inline: false
                });
            } else {
                let lowerField = `${emoji} ${item.trackInfo.title} `;
                lowerField += item.trackInfo.length ? `[${secondsToMS(item.trackInfo.length)}] ` : '';
                lowerField += `(${item.trackInfo.queuedBy.displayName})`;

                fields.push({
                    name: upperField,
                    value: lowerField,
                    inline: false
                });
            }
        });

        if(this.queue.length > QUEUE_EMBED_ITEMS_LIMIT) {
            fields.push({
                name: `${this.size - QUEUE_EMBED_ITEMS_LIMIT} additional items`,
                value: `${this.size} items in queue total`,
                inline: false
            });
        }

        embed.addFields(fields);
        embed.setFooter(`Total queue time: ${secondsToMS(totalQueueTime)}`);
        embed.setColor(this.guild.me?.displayHexColor || Colors.white);

        return embed;
    }
}
