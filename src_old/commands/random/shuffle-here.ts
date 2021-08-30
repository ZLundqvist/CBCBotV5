import { Command } from "../../core/command";
import Discord from 'discord.js';
import * as random from '../../utils/random';
import { CommandError } from "../../core/command-error";

const name = 'ShuffleHere';
const keywords = [ 'shuffle here' ];
const description = 'Get a randomized list of everyone in your current channel.';

class ShuffleHere extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        const membersInVC = msg.member?.voice.channel?.members.map(member => member.displayName);

        if(!membersInVC || membersInVC.length === 0) {
            throw new CommandError('No members in your voicechannel');
            return;
        }

        // Shuffle and add numbers to results
        const shuffled = random.shuffle(membersInVC).map((memberName, index) => `${index + 1}. ${memberName}`);

        await msg.channel.send(shuffled.join('\n'), { code: true });
    }
}

export default new ShuffleHere();