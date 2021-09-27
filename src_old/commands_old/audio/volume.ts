import { Command } from "../../core/command";
import Discord from 'discord.js';
import AudioModule from '../../modules/audio';
import { CommandError } from "../../core/command-error";

const name = 'Volume';
const keywords = [ 'v', 'volume', 'volym' ];
const description = '[volume]. Set or get volume.';

class GetVolume extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        if(!msg.guild)
            return;

        if(!args.length || !args[0]) {
            const currentVolume = await AudioModule.getVolume(msg.guild);

            if(currentVolume === 100) {
                await msg.channel.send(`Current volume: :100:%`);
            } else {
                await msg.channel.send(`Current volume: ${currentVolume}%`);
            }
            return;
        }

        const newVolume = parseInt(args[0], 10);

        if(isNaN(newVolume)) {
            throw new CommandError(`That is not a volume: ${args[0]}`);
        } else {
            await AudioModule.setVolume(msg.guild, newVolume);

            if(newVolume === 100) {
                await msg.channel.send(`Volume set to: :100:%`);
            } else {
                await msg.channel.send(`Volume set to: ${args[0]}%`);
            }
        }
    }
}

export default new GetVolume();
