import Discord from 'discord.js';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { LocalAudioProvider } from '../../../constants';
import { SFXResource } from '../../../core/resource-handler';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';

export class GuildQueueLocalItem extends GuildQueueItem {
    private constructor(stream: Readable, trackInfo: TrackInfo) {
        super(LocalAudioProvider, stream, trackInfo);
    }

    public static create(resource: SFXResource, queuedBy: Discord.GuildMember, currentQueueSize: number): GuildQueueLocalItem {
        const trackInfo: TrackInfo = {
            title: resource.name,
            queuedBy: queuedBy,
            length: resource.metadata?.length,
            initialQueuePosition: currentQueueSize + 1
        };
        const stream = createReadStream(resource.path);
        return new GuildQueueLocalItem(stream, trackInfo);
    }
}
