import { Command } from "../../core/command";
import Discord from 'discord.js';
import postureCheck from "../../modules/posture-check";
import { CommandError } from "../../core/command-error";

const name = 'PostureCheck';
const keywords = [ 'pc' ];
const description = '<interval>. Enables PC. 0 to disable.';

class PostureCheck extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message, period: string): Promise<void> {
        if(!msg.guild)
            return;

        if(period) {
            let parsed = parseFloat(period);

            if(isNaN(parsed))
                throw new CommandError(`'${period}' is not a number`);

            if(parsed === 0) {
                postureCheck.disable(msg.guild);
                await msg.channel.send(`PostureCheck disabled`);
            } else if(parsed > 0) {
                await postureCheck.enable(msg.guild, parsed);
                await msg.channel.send(`PostureCheck enabled: ${postureCheck.getPeriod(msg.guild)} minutes`);
            }
        } else {
            if(postureCheck.isRunning(msg.guild)) {
                await msg.channel.send(`PostureCheck enabled: ${postureCheck.getPeriod(msg.guild)} minutes`);
            } else {
                await msg.channel.send(`PostureCheck disabled`);
            }
        }
    }
}

export default new PostureCheck();