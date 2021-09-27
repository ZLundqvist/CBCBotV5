import { Command } from "../../core/command";
import Discord from 'discord.js';
import { inSameChannelAs } from "../../utils/voice";
import audio from "../../modules/audio";

const name = 'Reset';
const keywords = [ 'reset', 'kill' ];
const description = 'Reset the audio module in the bot.';

class Leave extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild || !msg.member)
            return;

        if(inSameChannelAs(msg.member)) {
            audio.reset(msg.guild);
        }
    }
}

export default new Leave();