import { Command } from "../../core/command";
import Discord from 'discord.js';
import { Guild } from "../../database/entity/guild";
import { CommandError } from "../../core/command-error";
import ResourceHandler from "../../core/resource-handler";
import Fysiken from '../../modules/fysiken/';

const name = 'Fysiken';
const keywords = [ 'fysiken' ];
const description = '[threshold]. Shows current count or sets the threshold if specified';

class BotEntrySound extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message, threshold: string): Promise<void> {
        const parsedThreshold = parseInt(threshold);

        if(isNaN(parsedThreshold)) {
            const current = await Fysiken.getCurrentValue();
            await msg.channel.send(`${current} peeps @ Fysiken`);
        } else {
            Fysiken.addUser(msg.author, parsedThreshold);
            await msg.channel.send('noted');
        }
    }
}

export default new BotEntrySound();