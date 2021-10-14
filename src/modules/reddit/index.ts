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

type RedditImagePost = {
    buffer: Buffer;
    url: string;
    title: string;
};

class RedditModule extends Module {
    private readonly reddit: snoowrap;
    private defaultMode: RedditPostMode;

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

    async getRandom(subreddit: string, mode?: RedditPostMode): Promise<RedditImagePost> {
        // Get all urls from posts which links to pictures
        const posts = (await this.reddit[mode || this.defaultMode](subreddit, { limit: 100 }))
            .filter(post => post.url.endsWith('.png') || post.url.endsWith('.jpg'));

        const post = pickRandom(posts);
        if(!post) throw new CommandError('No posts found');

        const response = await axios.get<ArrayBuffer>(post.url, { responseType: 'arraybuffer' });
        return {
            buffer: Buffer.from(response.data),
            url: post.url,
            title: post.title
        };
    }
}

export default new RedditModule();
