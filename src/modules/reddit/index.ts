import axios from 'axios';
import Discord from 'discord.js';
import snoowrap from 'snoowrap';
import { CBCBotCore, CommandError, Module } from '../../core';
import { pickRandom } from '../../utils/random';

export enum RandomPostMode {
    NEW = 'getNew',
    RISING = 'getRising',
    HOT = 'getHot'
}

class RedditModule extends Module {
    reddit: snoowrap;
    mode: RandomPostMode;

    constructor() {
        super('Reddit');

        this.mode = RandomPostMode.RISING;
        this.reddit = new snoowrap({
            userAgent: 'put your user-agent string here',
            clientId: CBCBotCore.config.getConfigValue('reddit-client-id'),
            clientSecret: CBCBotCore.config.getConfigValue('reddit-client-secret'),
            refreshToken: CBCBotCore.config.getConfigValue('reddit-refresh-token')
        });
    }

    async init(client: Discord.Client<true>): Promise<void> { }
    async destroy(): Promise<void> { }

    setMode(mode: RandomPostMode) {
        this.mode = mode;
    }

    getMode(): RandomPostMode {
        return this.mode;
    }

    async getRandom(subreddit: string, mode?: RandomPostMode): Promise<Buffer> {
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

export default new RedditModule();
