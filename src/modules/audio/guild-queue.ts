import Discord from 'discord.js';
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

export interface GuildQueueItem {
    id: string;
    title: string;
    queuedBy: Discord.User;
    play: (connection: Discord.VoiceConnection) => Promise<Discord.StreamDispatcher>;
    color: string;
    emoji: string;
    length?: number;
    thumbnail?: string;
    link?: string;
    notifyMsg?: Discord.Message;
}

export class GuildQueue {
    readonly guildID: string;
    private queue: GuildQueueItem[];

    constructor(guild: Discord.Guild) {
        this.guildID = guild.id;
        this.queue = [];
    }

    getAll(): GuildQueueItem[] {
        return this.queue;
    }

    /**
     * Add items to queue
     * @param items 
     */
    add(...items: GuildQueueItem[]): void {
        this.queue.push(...items);
    }

    /** Clears queue */
    clear(): void {
        this.queue = [];
    }

    /**
     * Removes first item in queue
     */
    removeFirst(): void {
        this.queue.shift();
    }

    /**
     * Returns first item in queue (or undefined if empty queue)
     */
    getFirst(): GuildQueueItem | undefined {
        return this.queue[0];
    }

    length(): number {
        return this.queue.length;
    }

    /**
     * Removes the item with the given id
     * Returns true if the id was removed from the queue, false otherwise
     * @param id 
     */
    removeById(id: string): boolean {
        if(this.queue.find(item => item.id === id)) {
            this.queue = this.queue.filter(item => item.id !== id);
            return true;
        }

        return false;
    }
}