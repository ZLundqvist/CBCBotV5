import Discord from 'discord.js';
import { Command } from "../../core/command";
import admin from '../../modules/admin';
import { CommandError } from '../../core/command-error';

const name = 'RemoveAdmin';
const keywords = [ 'admin remove' ];
const description = '[@mention]. Removes an admin from the guild.';

class RemoveAdmin extends Command {
    constructor() {
        super(name, keywords, description, true, true);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        if(!msg.guild)
            return;

        const user = msg.mentions.users.first();
        if(!user) {
            throw new CommandError(`No user mentioned: @NAME`);
        }
    
        await admin.removeAdmin(msg.guild, user);
        await msg.channel.send(`Admin removed: ${user}`);
    }
}

export default new RemoveAdmin();
