import { Command } from "../../core/command";
import Discord from 'discord.js';
import { inSameChannelAs } from "../../utils/voice";
import audio from "../../modules/audio";

const name = 'Leave';
const keywords = [ 'leave', 'stick', 'dra', 'fuckoff' ];
const description = 'EJECT bot from channel.';

class Leave extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild || !msg.member)
            return;

        if(inSameChannelAs(msg.member)) {
            audio.stop(msg.guild);
            msg.guild.voice?.connection?.disconnect();
        }
    }
}

export default new Leave();