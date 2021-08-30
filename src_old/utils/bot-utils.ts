import Discord from 'discord.js';
import { Guild } from '../database/entity/guild';
import config from './config';
import getLogger from './logger';

const log = getLogger(__filename);

export async function hasPrefix(message: Discord.Message): Promise<boolean> {
    log.trace('hasPrefix::' + message)

    if(message.guild) {
        const guild = await Guild.findOneOrFail(message.guild.id);
        return message.content.startsWith(guild.prefix);
    } else {
        return message.content.startsWith(config.getConfigValue('default-prefix'));
    }
}

export function isOwner(user: Discord.User): boolean {
    log.trace('isOwner::' + user.id);
    return config.getConfigValue('owner-id') === user.id;
}
