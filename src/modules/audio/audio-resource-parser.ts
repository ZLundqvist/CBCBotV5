import { createAudioResource } from '@discordjs/voice';
import Discord, { Guild } from 'discord.js';
import { nanoid } from 'nanoid';
import validator from 'validator';
import ytSearch from 'youtube-search';
import { Colors, EmojiCharacters, LocalAudioProvider, YoutubeAudioProvider } from '@constants';
import { CommandError } from '../../core/command-error';
import ResourceHandler from '../../core/resource-handler';
import config from '../../utils/config';
import { getSFXEmbed, getYoutubeEmbed } from './embed-generator';
import { GuildQueueItem } from './guild-queue-item';
import ytdl from 'ytdl-core';


const searchOpts: ytSearch.YouTubeSearchOptions = {
    maxResults: 1,
    type: 'video',
    key: config.getConfigValue('youtube-api-key')
};

/**
 * Converts an audio resource to a GuildQueueItem
 * Supports youtube videos and local sfx's
 * Also generates a MessageEmbed that represents the results
 */
export async function smartParse(member: Discord.GuildMember, query: string, generateEmbed: boolean, currentQueueSize: number): Promise<GuildQueueItem> {
    // If resource matches an sfx
    const sfxPath = ResourceHandler.getSFXPath(query);
    if(sfxPath) {
        const audioResourceCreator = () => {
            return createAudioResource(sfxPath);
        };

        const item = new GuildQueueItem(
            query,
            member.user.id,
            member.displayName,
            audioResourceCreator,
            LocalAudioProvider,
            currentQueueSize + 1
        );

        if(generateEmbed) {
            item.embed = getSFXEmbed(member.guild, item);
        }

        return item;
    }

    // Get link from query
    const link = await parseQuery(query);

    // If link is a youtube URL
    if(ytdl.validateURL(link)) {
        let info = await ytdl.getInfo(link);

        const audioResourceCreator = () => {
            const stream = ytdl.downloadFromInfo(info, { quality: 'highestaudio', filter: 'audioonly' });
            return createAudioResource(stream);
        };

        const item = new GuildQueueItem(
            info.player_response.videoDetails.title,
            member.user.id,
            member.displayName,
            audioResourceCreator,
            YoutubeAudioProvider,
            currentQueueSize + 1
        );

        // Extract thumbnail with biggest dimensions
        const thumbnail = info.player_response.videoDetails.thumbnail.thumbnails.reduce((prev, current) => {
            return (prev.width > current.width) ? prev : current
        }).url;
        const length = parseInt(info.player_response.videoDetails.lengthSeconds, 10)

        item.setLength(length)
            .setLink(link)
            .setThumbnail(thumbnail);

        if(generateEmbed) {
            item.embed = getYoutubeEmbed(member.guild, item);
        }

        return item;
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
    const results = await ytSearch(query, searchOpts);

    if(results.results.length) {
        return results.results[0];
    }
}
