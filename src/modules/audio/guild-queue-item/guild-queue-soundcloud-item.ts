import Discord from 'discord.js';
import { Readable } from 'stream';
import { SoundcloudAudioProvider } from '../../../constants';
import { SoundcloudAPI } from '../../../utils/audio';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';

export class GuildQueueSoundCloudItem extends GuildQueueItem {
    private constructor(stream: Readable, trackInfo: TrackInfo) {
        super(SoundcloudAudioProvider, stream, trackInfo);
    }

    public static async create(link: string, queuedBy: Discord.GuildMember, currentQueueSize: number): Promise<GuildQueueSoundCloudItem> {
        const info = await SoundcloudAPI.getInfo(link);

        const trackInfo: TrackInfo = {
            title: info.title,
            queuedBy: queuedBy,
            initialQueuePosition: currentQueueSize + 1,
            length: info.duration / 1000,
            link: link,
            thumbnail: info.thumbnail
        };

        const stream = await info.downloadProgressive();
        return new GuildQueueSoundCloudItem(stream, trackInfo);
    }
}
