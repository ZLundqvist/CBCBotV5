import { Command } from "../../core/command";
import Discord from 'discord.js';
import * as random from '../../utils/random';
import { CommandError } from "../../core/command-error";

const name = 'Shuffle';
const keywords = [ 'shuffle' ];
const description = '<item1> <item2> ... <itemN>. Shuffles list of names.';

class Shuffle extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        if(!args.length) {
            throw new CommandError('No items to shuffle. Add them after command: shuffle <item1> <item2>...');
        }

        const shuffled = random.shuffle(args).map((item, index) => `${index + 1}. ${item}`);
        await msg.channel.send(shuffled.join('\n'), { code: true });
    }
}

export default new Shuffle();