import { Command } from "../../core/command";
import Discord from 'discord.js';
import getLogger from '../../utils/logger';
import { Guild, setGuildPrefix, getGuildPrefix } from "../../database/entity/guild";
const log = getLogger(__dirname);

const name = 'SetPrefix';
const keywords = [ 'prefix set' ];
const description = '<prefix>. Set new prefix in guild.';

class SetPrefix extends Command {
    constructor() {
        super(name, keywords, description, true, true);
    }

    async execute(msg: Discord.Message, newPrefix: string): Promise<void> {
        if(!msg.guild || !newPrefix)
            return;

        await setGuildPrefix(msg.guild, newPrefix);

        msg.channel.send(`Prefix set to: '${await getGuildPrefix(msg.guild)}'`);
        log.info(`Prefix changed in ${msg.guild.name}`);
    }
}

export default new SetPrefix();