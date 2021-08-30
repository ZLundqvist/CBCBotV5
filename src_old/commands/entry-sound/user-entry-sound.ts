import { Command } from "../../core/command";
import Discord from 'discord.js';
import { Guild } from "../../database/entity/guild";
import { CommandError } from "../../core/command-error";
import ResourceHandler from "../../core/resource-handler";
import entrySound from "../../modules/entry-sound";

const name = 'UserEntrySound';
const keywords = [ 'entry' ];
const description = '[sfx]. Show current or sets new entry sound for user.';

class UserEntrySound extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, newSFX: string): Promise<void> {
        if(!msg.guild || !msg.member)
            return;

        if(newSFX) {
            await entrySound.setMemberEntrySFX(msg.member, newSFX);
            await msg.channel.send(`New entrysound: '${await entrySound.getMemberEntrySFX(msg.member)}'`);
        } else {
            let entrysound = await entrySound.getMemberEntrySFX(msg.member);
            if(!entrysound)
                throw new CommandError('No entrysound set.');
    
            await msg.channel.send(`Entrysound: ${entrysound}`);
        }
    }
}

export default new UserEntrySound();