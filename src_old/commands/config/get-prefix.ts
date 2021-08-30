import { Command } from "../../core/command";
import Discord from 'discord.js';
import getLogger from '../../utils/logger';
import { Guild, getGuildPrefix } from "../../database/entity/guild";
const log = getLogger(__dirname);

const name = 'GetPrefix';
const keywords = [ 'prefix', 'prefix get' ];
const description = 'Display prefix for guild.';

class GetPrefix extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild)
            return;

        await msg.channel.send(`Current prefix: '${await getGuildPrefix(msg.guild)}'`);
    }
}

export default new GetPrefix();