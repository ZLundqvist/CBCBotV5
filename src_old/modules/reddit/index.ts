import Discord from 'discord.js';
import axios from 'axios';
import snoowrap from 'snoowrap';
import { CommandError } from '../../core/command-error';
import { Module } from "../../core/module";
import config from '../../utils/config';
import getLogger from '../../utils/logger';
import { pickRandom } from '../../utils/random';

const log = getLogger(__dirname);

export enum RandomPostMode {
    NEW = 'getNew',
    RISING = 'getRising',
    HOT = 'getHot'
}

class Reddit extends Module {
    reddit?: snoowrap;
    mode: RandomPostMode;

    constructor() {
        super('Reddit');

        this.mode = RandomPostMode.RISING;
    }

    async init(client: Discord.Client): Promise<void> {
        this.reddit = new snoowrap({
            userAgent: 'put your user-agent string here',
            clientId: config.getConfigValue('reddit-client-id'),
            clientSecret: config.getConfigValue('reddit-client-secret'),
            refreshToken: config.getConfigValue('reddit-refresh-token')
        });
        log.debug('Reddit API wrapper initialized');
    }

    setMode(mode: RandomPostMode) {
        this.mode = mode;
    }

    getMode(): RandomPostMode {
        return this.mode;
    }

    async getRandom(subreddit: string, mode?: RandomPostMode): Promise<Buffer> {
        if(!this.reddit) throw new CommandError('Reddit API not ready yet');

        // Get all urls from posts which links to pictures
        const urls = (await this.reddit[mode || this.mode](subreddit, { limit: 100 }))
            .map(post => post.url)
            .filter(url => url.endsWith('.png') || url.endsWith('.jpg'));

        const url = pickRandom(urls);
        if(!url) throw new CommandError('No posts found');

        const data = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(data.data);
    }
}

export default new Reddit();