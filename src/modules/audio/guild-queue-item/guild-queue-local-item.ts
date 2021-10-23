import Discord from 'discord.js';
import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { LocalAudioProvider } from '../../../constants';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';


export class GuildQueueLocalItem extends GuildQueueItem {
    private path: string;

    constructor(path: string, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        super(LocalAudioProvider, queuedBy, initialQueuePosition);
        this.path = path;
    }

    async getTrackInfo(): Promise<TrackInfo> {
        return {
            title: path.basename(this.path),
            queuedBy: this.queuedBy,
            initialQueuePosition: this.initialQueuePosition
        };
    }

    async getReadable(): Promise<Readable> {
        return createReadStream(this.path);
    }
}
