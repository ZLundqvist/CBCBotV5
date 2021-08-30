import Discord, { EmbedField } from 'discord.js';
import { Youtube } from '../../constants/audio-provider';
import colors from '../../constants/colors';
import audio from "../../modules/audio";
import { resolveEmojiString } from "../../utils/emoji";
import { secondsToMS } from "../../utils/time";
import { GuildQueueItem } from "./guild-queue";
import emojiCharacter from '../../constants/emoji-character';

const QUEUE_DISPLAY_LIMIT = 15;

export function getYoutubeVideoEmbed(guild: Discord.Guild, item: GuildQueueItem): Discord.MessageEmbed {
    const queueLength = audio.getQueue(guild).length;
    const emoji = resolveEmojiString(item.emoji, guild);
    const color = Youtube.color;

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

    if(queueLength >= 1) {
        fields.push({
            name: 'Position',
            value: `#${queueLength + 1}`,
            inline: true
        })
    }

    fields.push({
        name: 'Queued by', 
        value: item.queuedBy.username,
        inline: true
    })

    embed.addFields(fields);
    embed.setFooter(`Skip using the ${emojiCharacter.reject} reaction`);
    return embed;
}

export function getSFXEmbed(guild: Discord.Guild, item: GuildQueueItem): Discord.MessageEmbed {
    const queueLength = audio.getQueue(guild).length;
    const emoji = resolveEmojiString(item.emoji, guild);
    const color = colors.white;

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

    if(queueLength >= 1) {
        fields.push({
            name: 'Position',
            value: `#${queueLength + 1}`,
            inline: true
        })
    }

    fields.push({
        name: 'Queued by', 
        value: item.queuedBy.username,
        inline: true
    })

    embed.addFields(fields);
    return embed;
}

export function getQueueEmbed(guild: Discord.Guild): Discord.MessageEmbed {
    const items = audio.getQueue(guild);

    const fields: Discord.EmbedField[] = [];
    const embed = new Discord.MessageEmbed();
    let totalQueueTime = items.reduce((acc, cur) => acc+= cur.length ? cur.length : 0, 0);

    items.slice(0, QUEUE_DISPLAY_LIMIT).forEach((item, index) => {
        const emoji = resolveEmojiString(item.emoji, guild);
        let upperField = `#${index + 1}`;
        if (index === 0) {
            if (guild.voice?.connection?.dispatcher) {
                upperField = 'Current';
                let lowerField = `${emoji} ${item.title} `;
                lowerField += item.length ? `[${secondsToMS(guild.voice.connection.dispatcher.streamTime / 1000)}/${secondsToMS(item.length)}] ` : '';
                lowerField += `(${item.queuedBy.username})`;
                
                fields.push({
                    name: upperField,
                    value: lowerField
                } as EmbedField);
            } else {
                let lowerField = `${emoji} ${item.title} `;
                lowerField += item.length ? `[${secondsToMS(item.length)}] ` : '';
                lowerField += `(${item.queuedBy.username})`;
                
                fields.push({
                    name: upperField,
                    value: lowerField
                } as EmbedField);
            }
        } else {
            let lowerField = `${emoji} ${item.title} `;
            lowerField += item.length ? `[${secondsToMS(item.length)}] `: '';
            lowerField += `(${item.queuedBy.username})`;

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
        embed.setColor(guild.me?.displayHexColor);
    }
    
    embed.addFields(fields);
    return embed;
}
