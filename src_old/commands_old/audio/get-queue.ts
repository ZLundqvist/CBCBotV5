import { Command } from "../../core/command";
import Discord from 'discord.js';
import { getQueueEmbed } from "../../modules/audio/embed-generator";

const name = 'GetQueue';
const keywords = [ 'queue', 'q', 'now', 'nu' ];
const description = 'Get current queue.';

class GetQueue extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild)
            return;

        await msg.channel.send(getQueueEmbed(msg.guild));
    }
}

export default new GetQueue();