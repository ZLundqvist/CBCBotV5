import { Command } from "../../core/command";
import Discord from 'discord.js';
import members from "../../modules/members";

const name = 'UpdateMemberNames';
const keywords = [ 'updatenames' ];
const description = 'Update member names in database for this guild.';

class UpdateMemberNames extends Command {
    constructor() {
        super(name, keywords, description, true, true);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild)
            return;
        
        const updateCount = await members.updateNames(msg.guild);
        await msg.channel.send(`${updateCount} names updated`);
    }
}

export default new UpdateMemberNames();