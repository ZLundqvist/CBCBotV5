import { Command } from "../../core/command";
import Discord from 'discord.js';
import alias from "../../modules/alias";
import { CommandError } from "../../core/command-error";

const name = 'ListAlias';
const keywords = [ 'alias list' ];
const description = 'List aliases in guild.';

class ListAlias extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        if(!msg.guild) {
            return;
        }

        const aliases = await alias.getAllInGuild(msg.guild);

        if(aliases.length === 0) {
            throw new CommandError('Add an alias first retard.');
        }

        let list: string[] = [];
        for(let alias of aliases) {
            list.push(`${alias.key} -> ${alias.value}`);
        }

        await msg.channel.send(`Aliases in guild ${msg.guild?.name}\n` + list.join('\n'), { code: true });
    }
}

export default new ListAlias();