import { Command } from "../../core/command";
import Discord from 'discord.js';
import currency from "../../modules/currency";

const name = 'GetMemberGold';
const keywords = [ 'gold' ];
const description = 'Show currency details.';

class GetMemberGold extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.member)
            return;

        await msg.channel.send(await currency.getMemberEmbed(msg.member));
    }
}

export default new GetMemberGold();