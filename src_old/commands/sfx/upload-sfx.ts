import Discord from 'discord.js';
import { Command } from "../../core/command";
import { CommandError } from "../../core/command-error";
import ResourceHandler from "../../core/resource-handler";

const name = 'Upload SFX';
const keywords = [ 'sfx upload' ];
const description = 'Upload an SFX';

class UploadSFX extends Command {
    constructor() {
        super(name, keywords, description, false, true);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.attachments.size) throw new CommandError('No attachment');

        const attachment = msg.attachments.array()[0];
        if(!attachment.name?.endsWith('.mp3')) throw new CommandError('Attachment is not .mp3');
        if(typeof attachment.attachment !== 'string') throw new CommandError('Download failed');

        try {
            await ResourceHandler.downloadSFX(attachment.name, attachment.attachment);
        } catch(e) {
            throw new CommandError(e.message);
        }

        await msg.channel.send(`SFX ${attachment.name} added`);
    }
}

export default new UploadSFX();