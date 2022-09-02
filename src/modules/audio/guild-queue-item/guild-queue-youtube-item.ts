import Discord from 'discord.js';
import { YoutubeAudioProvider } from '../../../constants';
import { YoutubeAPI } from '../../../utils/audio';
import { GuildQueueItem, ReadableCreator, TrackInfo } from './guild-queue-item';

export class GuildQueueYoutubeItem extends GuildQueueItem {
    private constructor(trackInfo: TrackInfo, createReadable: ReadableCreator) {
        super(YoutubeAudioProvider, trackInfo, createReadable);
    }

    public static async create(link: string, queuedBy: Discord.GuildMember, currentQueueSize: number): Promise<GuildQueueYoutubeItem> {
        const info = await YoutubeAPI.getInfo(link);
        
        const thumbnail_url = info.player_response.videoDetails.thumbnail.thumbnails.reduce((prev, current) => {
            return (prev.width > current.width) ? prev : current
        }).url;

        const length = parseInt(info.player_response.videoDetails.lengthSeconds, 10);

        const trackInfo: TrackInfo = {
            title: info.player_response.videoDetails.title,
            queuedBy: queuedBy,
            initialQueuePosition: currentQueueSize + 1,
            length: length,
            link: link,
            thumbnail: thumbnail_url
        };

        const createReadable: ReadableCreator = async () => {
            return YoutubeAPI.getReadableFromInfo(info);
        };
        return new GuildQueueYoutubeItem(trackInfo, createReadable);
    }
}
