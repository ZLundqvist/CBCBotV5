import Discord from 'discord.js';
import { createReadStream } from 'fs';
import { LocalAudioProvider } from '../../../constants';
import { SFXResource } from '../../../resources';
import { GuildQueueItem, ReadableCreator, TrackInfo } from './guild-queue-item';

export class GuildQueueLocalItem extends GuildQueueItem {
    private constructor(trackInfo: TrackInfo, createReadable: ReadableCreator) {
        super(LocalAudioProvider, trackInfo, createReadable);
    }

    public static create(resource: SFXResource, queuedBy: Discord.GuildMember, currentQueueSize: number): GuildQueueLocalItem {
        const trackInfo: TrackInfo = {
            title: resource.name,
            queuedBy: queuedBy,
            length: resource.metadata?.length,
            initialQueuePosition: currentQueueSize + 1
        };

        const createReadable: ReadableCreator = async () => {
            return createReadStream(resource.path);
        };

        return new GuildQueueLocalItem(trackInfo, createReadable);
    }
}
