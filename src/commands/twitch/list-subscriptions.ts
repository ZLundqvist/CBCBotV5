import { Command } from "../../core/command";
import Discord from 'discord.js';
import twitch from "../../modules/twitch";
import { CommandError } from "../../core/command-error";

const name = 'ListSubscription';
const keywords = ['twitch list'];
const description = 'list all channel subscriptions for this guild';

class ListSubscriptions extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if (!msg.guild) {
            throw new CommandError("Guild only command");
        }

        const items = await twitch.getSubscriptions(msg.guild);

        await msg.channel.send(`Twitch subscriptions:\n${items.map(i => 
            `${i.name} (${i.isActive ? 'Active' : 'Inactive'}) ${i.sfx ? `[${i.sfx}]` : ''}`
            ).join('\n')}`, { code: true });
    }
}

export default new ListSubscriptions();