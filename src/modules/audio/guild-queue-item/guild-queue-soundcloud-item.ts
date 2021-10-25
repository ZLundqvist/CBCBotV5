import Discord from 'discord.js';
import SoundCloud from 'soundcloud-scraper';
import { Readable } from 'stream';
import { SoundcloudAudioProvider } from '../../../constants';
import { Soundcloud } from '../../../utils/audio';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';

export class GuildQueueSoundCloudItem extends GuildQueueItem {
    private info?: SoundCloud.Song;
    private link: string;

    constructor(link: string, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        super(SoundcloudAudioProvider, queuedBy, initialQueuePosition);
        this.link = link;
    }

    async getTrackInfo(): Promise<TrackInfo> {
        if(!this.info) {
            this.info = await Soundcloud.getSongInfo(this.link);
        }

        return {
            title: this.info.title,
            queuedBy: this.queuedBy,
            initialQueuePosition: this.initialQueuePosition,
            length: this.info.duration / 1000,
            link: this.link,
            thumbnail: this.info.thumbnail
        };
    }

    async getReadable(): Promise<Readable> {
        if(!this.info) {
            this.info = await Soundcloud.getSongInfo(this.link);
        }

        return await this.info.downloadProgressive();
    }
}
