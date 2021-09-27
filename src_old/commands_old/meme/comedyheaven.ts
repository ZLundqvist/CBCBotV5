import Discord from 'discord.js';
import { Command } from "../../core/command";
import reddit from "../../modules/reddit";

const name = 'ComedyHeaven';
const keywords = [ 'comedy', 'heaven', 'comedyheaven' ];
const description = 'Show very funny /r/comedyheaven meme :)';

class ComedyHeaven extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        const img = await reddit.getRandom('comedyheaven');
        const attachment = new Discord.MessageAttachment(img);
        msg.channel.send(attachment);
    }
}

export default new ComedyHeaven();