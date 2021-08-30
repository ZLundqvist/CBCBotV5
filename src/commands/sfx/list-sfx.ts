import Discord from 'discord.js';
import { Command } from "../../core/command";
import ResourceHandler from "../../core/resource-handler";

const name = 'ListSFX';
const keywords = [ 'sfx' ];
const description = 'Display all SFXs';

class ListSFX extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        msg.channel.send(ResourceHandler.getAllSFX().join('\n'), { code: true });
    }
}

export default new ListSFX();