import axios from 'axios';
import Discord from 'discord.js';
import snoowrap from 'snoowrap';
import { BotCore, CommandError, Module } from '../../core';
import { pickRandom } from '../../utils/random';

export enum RedditPostMode {
    NEW = 'getNew',
    RISING = 'getRising',
    HOT = 'getHot'
}

class RedditModule extends Module {
    reddit: snoowrap;
    defaultMode: RedditPostMode;

    constructor() {
        super('Reddit');
        this.reddit = new snoowrap({
            userAgent: 'put your user-agent string here',
            clientId: BotCore.config.getConfigValue('reddit-client-id'),
            clientSecret: BotCore.config.getConfigValue('reddit-client-secret'),
            refreshToken: BotCore.config.getConfigValue('reddit-refresh-token')
        });
        this.defaultMode = RedditPostMode.RISING;
    }

    async init(client: Discord.Client<true>): Promise<void> { }
    async destroy(): Promise<void> { }

    async getRandom(subreddit: string, mode?: RedditPostMode): Promise<Buffer> {
        // Get all urls from posts which links to pictures
        const urls = (await this.reddit[mode || this.defaultMode](subreddit, { limit: 100 }))
            .map(post => post.url)
            .filter(url => url.endsWith('.png') || url.endsWith('.jpg'));

        const url = pickRandom(urls);
        if(!url) throw new CommandError('No posts found');

        const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
}

export default new RedditModule();
