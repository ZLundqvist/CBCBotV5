import Discord from 'discord.js';
import { Readable } from 'stream';
import { YoutubeAudioProvider } from '../../../constants';
import { YoutubeAPI } from '../../../utils/audio';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';

export class GuildQueueYoutubeItem extends GuildQueueItem {
    private constructor(stream: Readable, trackInfo: TrackInfo) {
        super(YoutubeAudioProvider, stream, trackInfo);
    }

    public static async create(link: string, queuedBy: Discord.GuildMember, currentQueueSize: number): Promise<GuildQueueYoutubeItem> {
        const info = await YoutubeAPI.getInfo(link);

        // Extract thumbnail with biggest dimensions
        const thumbnail = info.player_response.videoDetails.thumbnail.thumbnails.reduce((prev, current) => {
            return (prev.width > current.width) ? prev : current
        }).url;

        const length = parseInt(info.player_response.videoDetails.lengthSeconds, 10);

        const trackInfo: TrackInfo = {
            title: info.player_response.videoDetails.title,
            queuedBy: queuedBy,
            initialQueuePosition: currentQueueSize + 1,
            length: length,
            link: link,
            thumbnail: thumbnail
        };

        const stream = YoutubeAPI.getReadableFromInfo(info);
        return new GuildQueueYoutubeItem(stream, trackInfo);
    }
}
