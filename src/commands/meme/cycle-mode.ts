import Discord from 'discord.js';
import { Command } from "../../core/command";
import { CommandError } from '../../core/command-error';
import reddit, { RandomPostMode } from '../../modules/reddit';

const name = 'Cycle Mode';
const keywords = [ 'meme mode' ];
const description = '- Cycle through the post modes';

class CycleMode extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        switch(reddit.getMode()) {
            case RandomPostMode.HOT:
                reddit.setMode(RandomPostMode.RISING);
                break;
            case RandomPostMode.RISING:
                reddit.setMode(RandomPostMode.NEW);
                break;
            case RandomPostMode.NEW:
                reddit.setMode(RandomPostMode.HOT);
                break;
            default:
                throw new CommandError('kan du inte cycla eller');
        }
        await msg.channel.send(`Meme mode set to: ${reddit.getMode()}`);
    }
}

export default new CycleMode();