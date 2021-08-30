import Discord from 'discord.js';
import { Command } from "../../core/command";
import admin from '../../modules/admin';

const name = 'ListAdmins';
const keywords = [ 'admins', 'admin', 'admin list', 'admins list' ];
const description = 'Returns a list of admins in guild.';

class ListAdmins extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild)
            return;
        
        const admins = await admin.getAdmins(msg.guild);
        admins.unshift(`Admins in guild: ${msg.guild.name}`);
        await msg.channel.send(admins.join('\n'), { code: true });
    }
}

export default new ListAdmins();