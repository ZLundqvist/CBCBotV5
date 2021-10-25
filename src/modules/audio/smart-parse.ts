import Discord from 'discord.js';
import validator from 'validator';
import { BotCore, CommandError } from '../../core';
import { Soundcloud, Youtube } from '../../utils/audio';
import { GuildQueueItem } from './guild-queue-item/guild-queue-item';
import { GuildQueueLocalItem } from './guild-queue-item/guild-queue-local-item';
import { GuildQueueSoundCloudItem } from './guild-queue-item/guild-queue-soundcloud-item';
import { GuildQueueYoutubeItem } from './guild-queue-item/guild-queue-youtube-item';

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
    const url = await parseQuery(query);

    // If link is a youtube URL
    if(Youtube.validateURL(url)) {
        return new GuildQueueYoutubeItem(url, member, currentQueueSize + 1);
    }

    if(Soundcloud.validateURL(url)) {
        return new GuildQueueSoundCloudItem(url, member, currentQueueSize + 1);
    }

    throw new CommandError(`Cannot stream: ${query}`);
}

/**
 * Parses a query into a URL, either by validating that it already is a URL or 
 * by performing a YT search and returning the link to the first result.
 * @param query 
 * @returns 
 */
async function parseQuery(query: string): Promise<string> {
    if(validator.isURL(query)) {
        return query;
    }

    // Resource is not an URL, query youtube
    const result = await Youtube.search(query);

    if(!result) {
        throw new CommandError(`Nothing found on Youtube for: ${query}`);
    }

    return result;
}
