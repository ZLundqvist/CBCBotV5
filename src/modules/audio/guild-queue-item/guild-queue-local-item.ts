import Discord from 'discord.js';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { LocalAudioProvider } from '../../../constants';
import { SFXResource } from '../../../core/resource-handler';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';


export class GuildQueueLocalItem extends GuildQueueItem {
    private resource: SFXResource;

    constructor(resource: SFXResource, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        super(LocalAudioProvider, queuedBy, initialQueuePosition);
        this.resource = resource;
    }

    async getTrackInfo(): Promise<TrackInfo> {
        return {
            title: this.resource.name,
            queuedBy: this.queuedBy,
            length: this.resource.metadata?.length,
            initialQueuePosition: this.initialQueuePosition
        };
    }

    async getReadable(): Promise<Readable> {
        return createReadStream(this.resource.path);
    }
}
