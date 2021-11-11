import SoundCloud from 'soundcloud-scraper';
import getLogger from '../logger';

const log = getLogger('util/audio');

class SoundcloudWrapper {
    private client?: SoundCloud.Client;

    constructor() {
        this.createClient();
    }

    private async createClient(): Promise<void> {
        const apiKey = await SoundCloud.Util.keygen();
        this.client = new SoundCloud.Client(apiKey);
        log.debug(`Fetched SoundCloud API key (${apiKey})`);
    }

    async getInfo(url: string): Promise<SoundCloud.Song> {
        if(!this.client) throw new Error('Soundcloud client not initialized');

        return await this.client.getSongInfo(url);
    }

    validateURL(url: string): boolean {
        return SoundCloud.Util.validateURL(url, 'track');
    }
}

export const SoundcloudAPI = new SoundcloudWrapper();
