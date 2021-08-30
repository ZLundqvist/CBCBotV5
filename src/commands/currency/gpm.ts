import { Command } from "../../core/command";
import Discord from 'discord.js';
import { Guild } from "../../database/entity/guild";
import currency from "../../modules/currency";

const name = 'GoldPerMinute';
const keywords = [ 'gold gpm', 'gpm' ];
const description = '[gpm]. Show or set GPM in guild.';

class GoldPerMinute extends Command {
    constructor() {
        super(name, keywords, description, true, true);
    }

    async execute(msg: Discord.Message, newValue: string): Promise<void> {
        if(!msg.guild)
            return;

        if(!newValue) {
            await msg.channel.send(`Gold per minute: ${await currency.getGPM(msg.guild)}`);
        }

        const parsed = parseInt(newValue, 10);

        if(parsed && !isNaN(parsed)) {
            await currency.setGPM(msg.guild, parsed);
            await msg.channel.send(`Gold per minute set to: ${await currency.getGPM(msg.guild)}`);
        }
    }
}

export default new GoldPerMinute();