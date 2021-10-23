import Discord from 'discord.js';
import scdl from 'soundcloud-downloader';
import { TrackInfo as SoundCloudTrackInfo } from 'soundcloud-downloader/src/info';
import { Readable } from 'stream';
import { SoundcloudAudioProvider } from '../../../constants';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';

scdl.setClientID('6gsNBd4mJwXr0LxTBh8VKBOrViK6Aj56');

export class GuildQueueSoundCloudItem extends GuildQueueItem {
    private scdlInfo?: SoundCloudTrackInfo;
    private link: string;

    constructor(link: string, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        super(SoundcloudAudioProvider, queuedBy, initialQueuePosition);
        this.link = link;
    }

    async getTrackInfo(): Promise<TrackInfo> {
        if(!this.scdlInfo) {
            this.scdlInfo = await scdl.getInfo(this.link);
        }

        return {
            title: this.scdlInfo.title || 'NOT_FOUND',
            queuedBy: this.queuedBy,
            initialQueuePosition: this.initialQueuePosition,
            length: this.scdlInfo.duration ? this.scdlInfo.duration / 1000 : undefined,
            link: this.link,
            thumbnail: this.scdlInfo.artwork_url
        };
    }

    async getReadable(): Promise<Readable> {
        if(!this.scdlInfo) {
            this.scdlInfo = await scdl.getInfo(this.link);
        }

        return await scdl.download(this.link);
    }
}
