import { Command } from "../../core/command";
import Discord from 'discord.js';
import help from "../../modules/help";

const name = 'Help';
const keywords = [ 'help' ];
const description = '[group]. Shows a list of all command groups, or all commands for the entered group.';

class Help extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message, groupName: string): Promise<void> {
        if(groupName) {
            await msg.channel.send(help.getGroupEmbed(groupName), { code: true });
        } else {
            await msg.channel.send(help.getGroupsEmbed(), { code: true });
        }
    }
}

export default new Help();