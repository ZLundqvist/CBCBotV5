import { Command } from "../../core/command";
import Discord from 'discord.js';
import currency from "../../modules/currency";

const name = 'GoldGetTop';
const keywords = [ 'gold top' ];
const description = '[spots]. Shows a top [spots] gold list of users in this guild. default 10.';

class GoldGetTop extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, spots: string): Promise<void> {
        if(!msg.guild)
            return;

        let parsed = parseInt(spots, 10);
        await msg.channel.send(await currency.getTopEmbed(msg.guild, isNaN(parsed) ? undefined : parsed))
    }
}

export default new GoldGetTop();