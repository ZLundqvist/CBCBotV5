import { Command } from "../../core/command";
import Discord from 'discord.js';
import * as random from '../../utils/random';
import { CommandError } from "../../core/command-error";

const name = 'Roll';
const keywords = [ 'roll' ];
const description = '[min] [max]. Perform a WoW-roll. ';

class Roll extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message, min: string, max: string): Promise<void> {
        let parsedMin = 0;
        let parsedMax = 100;
        let roll;

        if(min) parsedMin = parseInt(min, 10);
        if(max) parsedMax = parseInt(max, 10);

        try {
            roll = random.roll(parsedMin, parsedMax);
        } catch(e) {
            throw new CommandError(e.message);
        }

        await msg.channel.send(`${msg.author.username} rolls ${roll} (${parsedMin}-${parsedMax})`);
        if(msg.deletable) await msg.delete();
    }
}

export default new Roll();