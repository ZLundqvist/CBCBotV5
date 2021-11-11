import { Readable } from 'stream';
import ytSearch from 'youtube-search';
import ytdl from 'ytdl-core';
import { BotCore } from '../../core';
import getLogger from '../logger';

const log = getLogger('util/audio');

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

    async getInfo(url: string): Promise<ytdl.videoInfo> {
        return await ytdl.getInfo(url);
    }

    getReadableFromInfo(info: ytdl.videoInfo, options: ytdl.downloadOptions = { quality: 'highestaudio', filter: 'audioonly', highWaterMark: 1 << 22 /* 4 MB */ }): Readable {
        return ytdl.downloadFromInfo(info, options);
    }

    validateURL(url: string): boolean {
        return ytdl.validateURL(url);
    }
}

export const YoutubeAPI = new YoutubeWrapper();
