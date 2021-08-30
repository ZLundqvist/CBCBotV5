import { Command } from "../../core/command";
import Discord from 'discord.js';

const name = 'Eval';
const keywords = [ 'eval' ];
const description = '';

class Eval extends Command {
    constructor() {
        super(name, keywords, description, false, true);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        await eval(args.join(' '));
    }
}

export default new Eval();