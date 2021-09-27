import { Command } from "../../core/command";
import Discord from 'discord.js';
import { CommandError } from "../../core/command-error";

const name = 'SetMemberGold';
const keywords = [ 'gold set' ];
const description = '';

class SetMemberGold extends Command {
    constructor() {
        super(name, keywords, description, true, true);
    }

    async execute(msg: Discord.Message): Promise<void> {
        throw new CommandError('Method not implemented');
    }
}

export default new SetMemberGold();