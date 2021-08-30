import Discord from 'discord.js';
import { Command } from "../../core/command";
import admin from '../../modules/admin';
import { CommandError } from '../../core/command-error';

const name = 'AddAdmin';
const keywords = [ 'admin add' ];
const description = '<@mention>. Adds mentioned user as admin.';

class AddAdmin extends Command {
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

        await admin.addAdmin(msg.guild, user);
        await msg.channel.send(`Admin added: ${user}`);
    }
}

export default new AddAdmin();