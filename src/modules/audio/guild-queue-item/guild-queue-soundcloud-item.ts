import Discord from 'discord.js';
import SoundCloud from 'soundcloud-scraper';
import { Readable } from 'stream';
import { SoundcloudAudioProvider } from '../../../constants';
import { SoundCloudWrapper } from '../../../utils/soundcloud';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';

export class GuildQueueSoundCloudItem extends GuildQueueItem {
    private songInfo?: SoundCloud.Song;
    private link: string;

    constructor(link: string, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        super(SoundcloudAudioProvider, queuedBy, initialQueuePosition);
        this.link = link;
    }

    async getTrackInfo(): Promise<TrackInfo> {
        if(!this.songInfo) {
            this.songInfo = await SoundCloudWrapper.getSongInfo(this.link);
        }

        return {
            title: this.songInfo.title,
            queuedBy: this.queuedBy,
            initialQueuePosition: this.initialQueuePosition,
            length: this.songInfo.duration / 1000,
            link: this.link,
            thumbnail: this.songInfo.thumbnail
        };
    }

    async getReadable(): Promise<Readable> {
        if(!this.songInfo) {
            this.songInfo = await SoundCloudWrapper.getSongInfo(this.link);
        }

        return await SoundCloudWrapper.getReadable(this.songInfo);
    }
}
