import { Command } from "../../core/command";
import Discord, { Guild } from 'discord.js';
import { inSameChannelAs, inVoiceChannel, connectIfAloneOrDisconnected } from "../../utils/voice";
import audio from "../../modules/audio";
import sleep from "../../utils/sleep";

const name = 'Play';
const keywords = [ 'play', 'spela' ];
const description = '<link/search>. Play link or search for video on youtube.';

class Play extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        if(!msg.guild || !msg.member)
            return;

        if(!inVoiceChannel(msg.guild) && msg.member.voice.channel) {
            await connectIfAloneOrDisconnected(msg.member.voice.channel);
            await sleep(2000);  // Let changes propagate
        }

        if(!inSameChannelAs(msg.member))
            return;

        let query = args.join(' ');

        if(!query)
            return;

        if(msg.channel.type === 'text') {
            await audio.playAndNotify(msg.member, msg.channel, query);
        }

        if(msg.deletable)
            await msg.delete();
    }
}

export default new Play();