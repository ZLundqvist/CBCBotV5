import Discord from 'discord.js';
import { getLoggerWrapper } from './logger';

const log = getLoggerWrapper('util/emoji');

export function resolveEmojiString(name: string, guild: Discord.Guild): string {
	const emoji = guild.emojis.cache.find((e) => e.name === name);

	if(!emoji) {
		return name;
	}

	return emoji.toString();
};

/**
 * Uploads an emoji to the given guild, given that it does not already exist
 * @param file path to the image file of the emoji
 * @param name the desired name of the emoji
 * @param guild the guild to upload to
 */
export async function uploadEmoji(file: string, name: string, guild: Discord.Guild): Promise<void> {
	const guildEmojis = await guild.emojis.fetch();
	const emoji = guildEmojis.find((emoji) => emoji.name === name);

	if(emoji) {
		log.warn(`Unable to upload emoji '${name}'. Emoji already exists.`);
	} else {
		try {
			await guild.emojis.create(file, name);
			log.info(`Emoji uploaded (name: ${name}, guild: ${guild.name})`);
		} catch(error: any) {
			const reason: string = error.code === 50013 ? 'MISSING_PERMISSIONS' : error.message
			log.error(`Error uploading emoji (name: ${name}, guild: ${guild.name}, reason: ${reason})`)
		}
	}
};
