import Discord from 'discord.js';
import { Readable } from 'stream';
import ytdl from 'ytdl-core';
import { YoutubeAudioProvider } from '../../../constants';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';


export class GuildQueueYoutubeItem extends GuildQueueItem {
    private videoInfo?: ytdl.videoInfo;
    private link: string;

    constructor(link: string, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        super(YoutubeAudioProvider, queuedBy, initialQueuePosition);
        this.link = link;
    }

    async getTrackInfo(): Promise<TrackInfo> {
        if(!this.videoInfo) {
            this.videoInfo = await ytdl.getInfo(this.link);
        }

        // Extract thumbnail with biggest dimensions
        const thumbnail = this.videoInfo.player_response.videoDetails.thumbnail.thumbnails.reduce((prev, current) => {
            return (prev.width > current.width) ? prev : current
        }).url;

        const length = parseInt(this.videoInfo.player_response.videoDetails.lengthSeconds, 10);

        return {
            title: this.videoInfo.player_response.videoDetails.title,
            queuedBy: this.queuedBy,
            initialQueuePosition: this.initialQueuePosition,
            length: length,
            link: this.link,
            thumbnail: thumbnail
        };
    }

    async getReadable(): Promise<Readable> {
        if(!this.videoInfo) {
            this.videoInfo = await ytdl.getInfo(this.link);
        }

        return ytdl.downloadFromInfo(this.videoInfo, { quality: 'highestaudio', filter: 'audioonly', highWaterMark: 1 << 23 /* 8 MB */ });
    }
}
