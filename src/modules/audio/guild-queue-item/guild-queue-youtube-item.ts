import Discord, { MessageEmbed } from 'discord.js';
import { Readable } from 'stream';
import ytdl from 'ytdl-core';
import { EmojiCharacters, YoutubeAudioProvider } from '../../../constants';
import { resolveEmojiString } from '../../../utils/emoji';
import { secondsToMS } from '../../../utils/time';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';


export class GuildQueueYoutubeItem extends GuildQueueItem {
    private ytdlInfo?: ytdl.videoInfo;
    private link: string;

    constructor(link: string, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        super(YoutubeAudioProvider, queuedBy, initialQueuePosition);
        this.link = link;
    }

    async getTrackInfo(): Promise<TrackInfo> {
        if(!this.ytdlInfo) {
            this.ytdlInfo = await ytdl.getInfo(this.link);
        }

        // Extract thumbnail with biggest dimensions
        const thumbnail = this.ytdlInfo.player_response.videoDetails.thumbnail.thumbnails.reduce((prev, current) => {
            return (prev.width > current.width) ? prev : current
        }).url;

        const length = parseInt(this.ytdlInfo.player_response.videoDetails.lengthSeconds, 10);

        return {
            title: this.ytdlInfo.player_response.videoDetails.title,
            queuedBy: this.queuedBy,
            initialQueuePosition: this.initialQueuePosition,
            length: length,
            link: this.link,
            thumbnail: thumbnail
        };
    }

    async getReadable(): Promise<Readable> {
        if(!this.ytdlInfo) {
            this.ytdlInfo = await ytdl.getInfo(this.link);
        }

        return ytdl.downloadFromInfo(this.ytdlInfo, { quality: 'highestaudio', filter: 'audioonly', highWaterMark: 1 << 23 /* 8 MB */ });
    }

    async getMessageEmbed(): Promise<MessageEmbed> {
        const info = await this.getTrackInfo();

        const emoji = resolveEmojiString(this.provider.emoji, this.queuedBy.guild);
        const color = YoutubeAudioProvider.color;

        const fields: Discord.EmbedField[] = [];
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${info.title}`, undefined, info.link)
            .setTitle(`${emoji} ${info.link}`)
            .setColor(color);

        if(info.thumbnail) embed.setThumbnail(info.thumbnail);
        if(info.link) embed.setURL(info.link);

        if(info.length) {
            fields.push({
                name: 'Length',
                value: secondsToMS(info.length),
                inline: true
            });
        }

        if(this.initialQueuePosition >= 1) {
            fields.push({
                name: 'Position',
                value: `#${this.initialQueuePosition}`,
                inline: true
            })
        }

        fields.push({
            name: 'Queued by',
            value: this.queuedBy.displayName,
            inline: true
        })

        embed.addFields(fields);
        embed.setFooter(`Skip using the ${EmojiCharacters.reject} reaction`);
        return embed;
    }
}
