import Discord from 'discord.js';
import { Command } from "../../core/command";
import reddit from "../../modules/reddit";

const name = 'me_irl';
const keywords = [ 'meirl', 'me_irl' ];
const description = 'Show very funny /r/me_irl meme :)';

class MeIRL extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        const img = await reddit.getRandom('me_irl');
        const attachment = new Discord.MessageAttachment(img);
        msg.channel.send(attachment);
    }
}

export default new MeIRL();