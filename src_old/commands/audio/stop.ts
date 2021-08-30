import { Command } from "../../core/command";
import Discord, { Guild } from 'discord.js';
import { inSameChannelAs } from "../../utils/voice";
import audio from "../../modules/audio";

const name = 'Stop';
const keywords = [ 'stop', 'sluta', 'end' ];
const description = 'Stops playing and clears queue.';

class Stop extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild || !msg.member)
            return;

        if(!inSameChannelAs(msg.member))
            return;

        audio.stop(msg.guild);
    }
}

export default new Stop();