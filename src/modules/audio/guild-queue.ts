import { GuildQueueItem } from './guild-queue-item';

export class GuildQueue {
    private queue: GuildQueueItem[];

    constructor() {
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
}
