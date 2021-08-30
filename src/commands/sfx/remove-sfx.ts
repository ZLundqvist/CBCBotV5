import Discord from 'discord.js';
import { Command } from "../../core/command";
import ResourceHandler from "../../core/resource-handler";

const name = 'Remove SFX';
const keywords = [ 'sfx remove' ];
const description = '[sfx_name] - Removes an SFX';

class RemoveSFX extends Command {
    constructor() {
        super(name, keywords, description, false, true);
    }

    async execute(msg: Discord.Message, name: string): Promise<void> {
        if(ResourceHandler.sfxExists(name)) {
            ResourceHandler.removeSFX(name);
            await msg.channel.send(`SFX ${name} removed`);
        } else {
            await msg.channel.send(`SFX ${name} does not exist`);
        }
    }
}

export default new RemoveSFX();