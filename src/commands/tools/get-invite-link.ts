import { Command } from "../../core/command";
import Discord from 'discord.js';

const name = 'GetInviteLink';
const keywords = [ 'invite' ];
const description = 'Get link to invite bot to other servers.';

class GetInviteLink extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        await msg.channel.send(`https://discordapp.com/api/oauth2/authorize?client_id=${msg.client.user?.id}&permissions=8&scope=bot`);
    }
}

export default new GetInviteLink();