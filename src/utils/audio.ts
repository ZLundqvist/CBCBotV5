import SoundCloud from 'soundcloud-scraper';
import ytSearch from 'youtube-search';
import ytdl from 'ytdl-core';
import { BotCore } from '../core';
import { LocalResource } from '../core/resource-handler';
import getLogger from './logger';
import { MP3Parser } from './mp3-parser/mp3-parser';

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

    async getSongInfo(url: string): Promise<SoundCloud.Song> {
        if(!this.client) throw new Error('Soundcloud client not initialized');

        return await this.client.getSongInfo(url);
    }

    validateURL(url: string): boolean {
        return SoundCloud.Util.validateURL(url, 'track');
    }
}

class YoutubeWrapper {
    async search(query: string): Promise<string | undefined> {
        const search = await ytSearch(query, {
            maxResults: 1,
            type: 'video',
            key: BotCore.config.getValue('youtube-api-key')
        });

        if(search.results.length) {
            return search.results[0].link;
        }
    }

    async getSongInfo(url: string): Promise<ytdl.videoInfo> {
        return await ytdl.getInfo(url);
    }

    validateURL(url: string): boolean {
        return ytdl.validateURL(url);
    }
}

export type MP3Metadata = {
    /**
     * Length in number of seconds
     */
    length: number;
};

export const Soundcloud = new SoundcloudWrapper();
export const Youtube = new YoutubeWrapper();

export function getMP3Metadata(sfx: LocalResource): MP3Metadata | undefined {
    const parser = new MP3Parser(sfx);

    return parser.getMetadata();
}
