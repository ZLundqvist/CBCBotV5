import { Command } from "../../core/command";
import Discord from 'discord.js';
import twitch from "../../modules/twitch";
import { CommandError } from "../../core/command-error";

const name = 'AddSubscription';
const keywords = [ 'twitch add' ];
const description = '<twitch username> - add subscription for twitch channel in this guild';

class AddSubscription extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, stream: string, sfx?: string): Promise<void> {
        if(!msg.guild) throw new CommandError("Guild only command");
        if(stream) throw new CommandError('Empty name');
        
        await twitch.addSubscription(msg.guild, stream, sfx);

        await msg.channel.send(`Now subscribed to channel **${stream}**`);
    }
}

export default new AddSubscription();