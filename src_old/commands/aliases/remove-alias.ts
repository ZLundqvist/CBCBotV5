import { Command } from "../../core/command";
import Discord from 'discord.js';
import alias from "../../modules/alias";

const name = 'RemoveAlias';
const keywords = [ 'alias remove' ];
const description = '<key>. Remove alias with given key in guild.';

class RemoveAlias extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        if(!msg.guild) {
            return;
        }

        let key = args.join(' ');

        if(!key) {
            return;
        }

        await alias.removeInGuild(msg.guild, key);
        await msg.channel.send(`Alias removed: ${key}`);
    }
}

export default new RemoveAlias();