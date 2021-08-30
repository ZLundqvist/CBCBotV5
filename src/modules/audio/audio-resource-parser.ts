import Discord from 'discord.js';
import { Readable } from 'stream';
import validUrl from 'valid-url';
import ytSearch from 'youtube-search';
import colors from '../../constants/colors';
import emojiCharacter from '../../constants/emoji-character';
import { CommandError } from '../../core/command-error';
import ResourceHandler from '../../core/resource-handler';
import config from '../../utils/config';
import { getSFXEmbed } from './embed-generator';
import { GuildQueueItem } from './guild-queue';
import { isVideoURL, parseVideo } from './video-parser';
import { nanoid } from 'nanoid'

export type AudioResource = Readable | string;

export interface ParseResult {
    embed: Discord.MessageEmbed | null;
    item: GuildQueueItem;
}

const searchOpts: ytSearch.YouTubeSearchOptions = {
    maxResults: 1,
    type: 'video',
    key: config.getConfigValue('youtube-api-key')
};

/**
 * Converts an audio resource to a GuildQueueItem[]
 * Supports youtube videos, youtube playlists and local sfx's
 * Also generates a MessageEmbed that represents the results
 */
export async function smartParse(resource: AudioResource, member: Discord.GuildMember): Promise<ParseResult> {
    // If stream, return it
    if(resource instanceof Readable) {
        // Nothing can be parsed from a stream
        return {
            item: {
                id: nanoid(),
                play: async (connection) => connection.play(resource),
                queuedBy: member.user,
                title: 'unknown stream',
                emoji: emojiCharacter.note,
                color: colors.white
            },
            embed: null
        };
    }

    // If resource matches an sfx
    if(ResourceHandler.sfxExists(resource)) {
        const queueItem: GuildQueueItem = {
            id: nanoid(),
            play: async (connection) => connection.play(ResourceHandler.getSFXPath(resource)!),
            title: resource,
            queuedBy: member.user,
            emoji: emojiCharacter.note,
            color: colors.white
        };

        return {
            item: queueItem,
            embed: getSFXEmbed(member.guild, queueItem)
        };
    }

    // Get link from resource
    const link = await getLink(resource);
    if(isVideoURL(link)) {
        return await parseVideo(member, link);
    }

    throw new CommandError(`Cannot stream: ${resource}`);
}

async function getLink(resource: string) {
    if(validUrl.isWebUri(resource)) {
        return resource;
    }

    // Resource is not an URL, query youtube
    let result = await search(resource);

    if(!result) {
        throw new CommandError(`Nothing found for: ${resource}`);
    }

    return result.link;
}

async function search(query: string): Promise<ytSearch.YouTubeSearchResults | undefined> {
    const results = await ytSearch(query, searchOpts);

    if(results.results.length) {
        return results.results[0];
    }
}