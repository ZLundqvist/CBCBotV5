import SoundCloud from 'soundcloud-scraper';
import { Readable } from 'stream';
import getLogger from './logger';

const log = getLogger('util/soundcloud');

class SoundCloudScraperWrapper {
    private client?: SoundCloud.Client;

    private async getClient(): Promise<SoundCloud.Client> {
        if(!this.client) {
            const apiKey = await SoundCloud.Util.keygen();
            this.client = new SoundCloud.Client(apiKey);
            log.debug(`Fetched SoundCloud API key (${apiKey})`);
        }

        return this.client;
    }

    async getSongInfo(url: string): Promise<SoundCloud.Song> {
        const client = await this.getClient();
        return await client.getSongInfo(url);
    }

    async getReadable(song: SoundCloud.Song): Promise<Readable> {
        return await song.downloadProgressive();
    }

    validateURL(url: string): boolean {
        return SoundCloud.Util.validateURL(url, 'track');
    }
}

export const SoundCloudWrapper = new SoundCloudScraperWrapper();
