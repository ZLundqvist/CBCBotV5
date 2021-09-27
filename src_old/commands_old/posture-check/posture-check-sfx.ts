import { Command } from "../../core/command";
import Discord from 'discord.js';
import postureCheck from "../../modules/posture-check";

const name = 'SetPCSFX';
const keywords = [ 'pc sfx' ];
const description = '<sfx name>. Sets PC SFX';

class SetPCSFX extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, newSFX: string): Promise<void> {
        if(!msg.guild)
            return;

        if(!newSFX) {
            const sfx = await postureCheck.getSFX(msg.guild);
            await msg.channel.send(sfx ? `Current SFX: **${sfx}**` : `PostureCheck SFX not set`);
        } else {
            await postureCheck.setSFX(msg.guild, newSFX);
            const sfx = await postureCheck.getSFX(msg.guild);
            await msg.channel.send(`PostureCheck SFX set to: **${sfx}**`);
        }
    }
}

export default new SetPCSFX();