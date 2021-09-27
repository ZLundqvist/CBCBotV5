import { Command } from "../../core/command";
import Discord, { Guild } from 'discord.js';
import { connect, inSameChannelAs } from "../../utils/voice";
import audio from "../../modules/audio";

const name = 'Skip';
const keywords = [ 'skip', 'next', 'nästa' ];
const description = 'Skips current song.';

class Skip extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild || !msg.member)
            return;

        if(!inSameChannelAs(msg.member))
            return;

        audio.skip(msg.guild);
    }
}

export default new Skip();