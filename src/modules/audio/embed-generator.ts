import Discord, { EmbedField } from 'discord.js';
import { Colors, EmojiCharacters } from '../../constants';
import { YoutubeAudioProvider } from '../../constants/audio-provider';
import { resolveEmojiString } from "../../utils/emoji";
import { secondsToMS } from "../../utils/time";
import { GuildQueueItem } from './guild-queue-item';

const QUEUE_DISPLAY_LIMIT = 10;

export function getYoutubeEmbed(guild: Discord.Guild, item: GuildQueueItem): Discord.MessageEmbed {
    const emoji = resolveEmojiString(item.provider.emoji, guild);
    const color = YoutubeAudioProvider.color;

    const fields: Discord.EmbedField[] = [];
    const embed = new Discord.MessageEmbed()
        .setAuthor(`${item.title}`, undefined, item.link)
        .setTitle(`${emoji} ${item.link}`)
        .setColor(color);

    if(item.thumbnail) embed.setThumbnail(item.thumbnail);
    if(item.link) embed.setURL(item.link);

    if(item.length) {
        fields.push({
            name: 'Length',
            value: secondsToMS(item.length),
            inline: true
        });
    }

    if(item.initialQueuePosition >= 1) {
        fields.push({
            name: 'Position',
            value: `#${item.initialQueuePosition}`,
            inline: true
        })
    }

    fields.push({
        name: 'Queued by',
        value: item.queuedByName,
        inline: true
    })

    embed.addFields(fields);
    embed.setFooter(`Skip using the ${EmojiCharacters.reject} reaction`);
    return embed;
}

export function getSFXEmbed(guild: Discord.Guild, item: GuildQueueItem): Discord.MessageEmbed {
    const emoji = resolveEmojiString(item.provider.emoji, guild);
    const color = Colors.white;

    const fields: Discord.EmbedField[] = [];
    const embed = new Discord.MessageEmbed()
        .setTitle(`${emoji} ${item.title}`)
        .setColor(color);

    if(item.length) {
        fields.push({
            name: 'Length',
            value: secondsToMS(item.length),
            inline: true
        });
    }

    if(item.initialQueuePosition >= 1) {
        fields.push({
            name: 'Position',
            value: `#${item.initialQueuePosition}`,
            inline: true
        })
    }

    fields.push({
        name: 'Queued by',
        value: item.queuedByName,
        inline: true
    })

    embed.addFields(fields);
    return embed;
}

export function getQueueEmbed(guild: Discord.Guild, items: GuildQueueItem[]): Discord.MessageEmbed {
    const fields: Discord.EmbedField[] = [];
    const embed = new Discord.MessageEmbed();
    const totalQueueTime = items.reduce((acc, cur) => acc += cur.length ? cur.length : 0, 0);

    items.slice(0, QUEUE_DISPLAY_LIMIT).forEach((item, index) => {
        const emoji = resolveEmojiString(item.provider.emoji, guild);
        let upperField = `#${index + 1}`;
        if(index === 0) {
            upperField = 'Current';
            let lowerField = `${emoji} ${item.title} `;
            lowerField += item.length ? `[${secondsToMS(item.length)}] ` : '';
            lowerField += `(${item.queuedByName})`;

            fields.push({
                name: upperField,
                value: lowerField
            } as EmbedField);
        } else {
            let lowerField = `${emoji} ${item.title} `;
            lowerField += item.length ? `[${secondsToMS(item.length)}] ` : '';
            lowerField += `(${item.queuedByName})`;

            fields.push({
                name: upperField,
                value: lowerField
            } as EmbedField);
        }
    });

    if(items.length > QUEUE_DISPLAY_LIMIT) {
        fields.push({
            name: `${items.length - QUEUE_DISPLAY_LIMIT} additional items`,
            value: `${items.length} items in queue total`
        } as EmbedField);
    }

    embed.setFooter(`Total queue time: ${secondsToMS(totalQueueTime)}`);

    if(guild.me?.displayHexColor) {
        embed.setColor(guild.me.displayHexColor);
    }

    embed.addFields(fields);
    return embed;
}
