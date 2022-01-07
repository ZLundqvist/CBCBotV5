import Discord from 'discord.js';
import { SoundcloudAudioProvider } from '../../../constants';
import { SoundcloudAPI } from '../../../utils/audio';
import { GuildQueueItem, ReadableCreator, TrackInfo } from './guild-queue-item';

export class GuildQueueSoundCloudItem extends GuildQueueItem {
    private constructor(trackInfo: TrackInfo, createReadable: ReadableCreator) {
        super(SoundcloudAudioProvider, trackInfo, createReadable);
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

        const createReadable: ReadableCreator = async () => {
            return await info.downloadProgressive();
        };

        return new GuildQueueSoundCloudItem(trackInfo, createReadable);
    }
}
