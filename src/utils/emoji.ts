import Discord from 'discord.js';
import getLogger from './logger';

const log = getLogger('Emoji');

export function resolveEmojiString(name: string, guild: Discord.Guild): string {
	const emoji = guild.emojis.cache.find((e) => e.name === name);

	if (!emoji) {
		return name;
	}

	return emoji.toString();
};

export function uploadEmoji(file: string, name: string, guild: Discord.Guild): Promise<void> {
	return new Promise((resolve, reject) => {
		const emoji = guild.emojis.cache.find((e) => e.name === name);
		if (!emoji) {
			guild.emojis.create(file, name).then(() => {
				log.info(`Created emoji ${name} in ${guild}`);
				resolve();
			}, (err) => {
				if (err.code === 50013) {
					log.info(`Failed to upload emoji ${name} (${guild}): MISSING_PERMISSIONS`);
				} else {
					log.error(err);
				}
				reject();
			});
		}
	});
};
