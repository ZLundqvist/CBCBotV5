import { Command } from "../../core/command";
import Discord from 'discord.js';
import twitch from "../../modules/twitch";
import { CommandError } from "../../core/command-error";

const name = 'RemoveSubscription';
const keywords = [ 'twitch remove' ];
const description = '<twitch username> - add subscription for twitch channel in this guild';

class RemoveSubscription extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        if(!msg.guild) {
            throw new CommandError("Guild only command");
        }
        await twitch.removeSubscription(msg.guild, args[0]);

        await msg.channel.send(`No longer subscribed to channel **${args[0]}**`);
    }
}

export default new RemoveSubscription();