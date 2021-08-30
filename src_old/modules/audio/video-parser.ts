import Discord from 'discord.js';
import ytdl from 'ytdl-core';
import { Youtube } from '../../constants/audio-provider';
import { CommandError } from '../../core/command-error';
import { ParseResult } from './audio-resource-parser';
import { getYoutubeVideoEmbed } from './embed-generator';
import { GuildQueueItem } from './guild-queue';
import { nanoid } from 'nanoid'

export async function parseVideo(member: Discord.GuildMember, link: string): Promise<ParseResult> {
    if(isYTVideo(link)) {
        let info = await ytdl.getInfo(link);

        // Extract thumbnail with biggest dimensions
        const thumbnail = info.player_response.videoDetails.thumbnail.thumbnails.reduce((prev, current) => {
            return (prev.width > current.width) ? prev : current
        });

        let queueItem: GuildQueueItem = {
            id: nanoid(),
            play: async (connection) => {
                const stream = ytdl.downloadFromInfo(info, { quality: 'highestaudio', filter: 'audioonly' });
                return connection.play(stream);
            },
            title: info.player_response.videoDetails.title,
            length: parseInt(info.player_response.videoDetails.lengthSeconds, 10),
            thumbnail: thumbnail.url,
            link: link,
            color: Youtube.color,
            emoji: Youtube.emoji,
            queuedBy: member.user
        };

        return {
            item: queueItem,
            embed: getYoutubeVideoEmbed(member.guild, queueItem)
        };
    } else {
        throw new CommandError(`Cannot parse video: ${link}`);
    }
}

export function isVideoURL(link: string) {
    return isYTVideo(link);
}

function isYTVideo(link: string) {
    return ytdl.validateURL(link);
}