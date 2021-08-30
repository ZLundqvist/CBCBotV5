import Discord from 'discord.js';
import { Command } from "../../core/command";
import reddit from "../../modules/reddit";

const name = 'OkBuddy';
const keywords = [ 'okbuddy' ];
const description = 'Show very funny /r/okbuddyretard meme :)';

class OkBuddyRetard extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        const img = await reddit.getRandom('okbuddyretard');
        const attachment = new Discord.MessageAttachment(img);
        msg.channel.send(attachment);
    }
}

export default new OkBuddyRetard();