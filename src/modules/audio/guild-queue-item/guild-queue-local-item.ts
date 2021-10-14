import Discord, { MessageEmbed } from 'discord.js';
import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { LocalAudioProvider } from '../../../constants';
import { resolveEmojiString } from '../../../utils/emoji';
import { secondsToMS } from '../../../utils/time';
import { GuildQueueItem, TrackInfo } from './guild-queue-item';


export class GuildQueueLocalItem extends GuildQueueItem {
    private path: string;

    constructor(path: string, queuedBy: Discord.GuildMember, initialQueuePosition: number) {
        super(LocalAudioProvider, queuedBy, initialQueuePosition);
        this.path = path;
    }

    async getTrackInfo(): Promise<TrackInfo> {
        return {
            title: path.basename(this.path),
            queuedBy: this.queuedBy,
            initialQueuePosition: this.initialQueuePosition
        };
    }

    async getReadable(): Promise<Readable> {
        return createReadStream(this.path);
    }

    async getMessageEmbed(): Promise<MessageEmbed> {
        const info = await this.getTrackInfo();

        const emoji = resolveEmojiString(this.provider.emoji, this.queuedBy.guild);
        const color = this.provider.color;

        const fields: Discord.EmbedField[] = [];
        const embed = new Discord.MessageEmbed()
            .setTitle(`${emoji} ${info.title}`)
            .setColor(color);

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
        return embed;
    }
}
