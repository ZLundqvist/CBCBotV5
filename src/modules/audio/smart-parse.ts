import Discord from 'discord.js';
import validator from 'validator';
import ytSearch from 'youtube-search';
import ytdl from 'ytdl-core';
import { BotCore, CommandError } from '../../core';
import { SoundCloudWrapper } from '../../utils/soundcloud';
import { GuildQueueItem } from './guild-queue-item/guild-queue-item';
import { GuildQueueLocalItem } from './guild-queue-item/guild-queue-local-item';
import { GuildQueueSoundCloudItem } from './guild-queue-item/guild-queue-soundcloud-item';
import { GuildQueueYoutubeItem } from './guild-queue-item/guild-queue-youtube-item';

const SEARCH_OPTIONS: ytSearch.YouTubeSearchOptions = {
    maxResults: 1,
    type: 'video',
    key: BotCore.config.getConfigValue('youtube-api-key')
};

/**
 * Converts an audio resource to a GuildQueueItem
 * Supports youtube videos and local sfx's
 * Also generates a MessageEmbed that represents the results
 */
export async function smartParse(query: string, member: Discord.GuildMember, currentQueueSize: number): Promise<GuildQueueItem> {
    // If resource matches an sfx
    const sfx = BotCore.resources.getSFX(query);
    if(sfx) {
        return new GuildQueueLocalItem(sfx, member, currentQueueSize + 1);
    }

    // Get link from query
    const link = await parseQuery(query);

    // If link is a youtube URL
    if(ytdl.validateURL(link)) {
        return new GuildQueueYoutubeItem(link, member, currentQueueSize + 1);
    }

    if(SoundCloudWrapper.validateURL(link)) {
        return new GuildQueueSoundCloudItem(link, member, currentQueueSize + 1);
    }

    throw new CommandError(`Cannot stream: ${query}`);
}

/**
 * Parses a query into a URL, either by validating that it already is a URL or 
 * by performing a YT search and returning the link to the first result.
 * @param query 
 * @returns 
 */
async function parseQuery(query: string) {
    if(validator.isURL(query)) {
        return query;
    }

    // Resource is not an URL, query youtube
    let result = await youtubeSearch(query);

    if(!result) {
        throw new CommandError(`Nothing found on Youtube for: ${query}`);
    }

    return result.link;
}

async function youtubeSearch(query: string): Promise<ytSearch.YouTubeSearchResults | undefined> {
    const results = await ytSearch(query, SEARCH_OPTIONS);

    if(results.results.length) {
        return results.results[0];
    }
}
