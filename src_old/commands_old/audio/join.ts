import { Command } from "../../core/command";
import Discord from 'discord.js';
import { connect } from "../../utils/voice";
import audio from "../../modules/audio";

const name = 'Join';
const keywords = [ 'kom', 'join' ];
const description = 'Call bot into current channel.';

class Join extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild || !msg.member)
            return;

        if(msg.member?.voice.channel && !audio.isPlaying(msg.guild)) {
            // If not playing, just join caller
            connect(msg.member.voice.channel);
        }
    }
}

export default new Join();