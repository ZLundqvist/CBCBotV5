import { Command } from "../../core/command";
import Discord from 'discord.js';
import { Guild } from "../../database/entity/guild";
import { CommandError } from "../../core/command-error";
import ResourceHandler from "../../core/resource-handler";

const name = 'BotEntrySound';
const keywords = [ 'botentry' ];
const description = '[sfx]. Shows current or sets new entrysound for bot.';

class BotEntrySound extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, newSFX: string): Promise<void> {
        if(!msg.guild)
            return;

        const guild = await Guild.findOneOrFail(msg.guild.id);
        if(newSFX) {
            if(!ResourceHandler.sfxExists(newSFX)) {
                throw new CommandError(`Invalid sfx: ${newSFX}`);
            }

            guild.entrysound = newSFX;
            await guild.save();
            await msg.channel.send(`New bot entrysound set to: '${guild.entrysound}'`);
        } else {
            if(!guild.entrysound)
                throw new CommandError('No bot entrysound set');
    
            await msg.channel.send(`Bot entrysound: ${guild.entrysound}`);
        }
    }
}

export default new BotEntrySound();