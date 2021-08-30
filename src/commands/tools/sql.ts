import Discord from 'discord.js';
import { getConnection } from "typeorm";
import { Command } from "../../core/command";

const name = 'SQL';
const keywords = [ 'sql' ];
const description = '[query] - Custom SQL query';

class SQL extends Command {
    constructor() {
        super(name, keywords, description, false, true);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        const queryResults = await getConnection().query(args.join(' '));
        const resultsString = JSON.stringify(queryResults, null, 2);

        if(resultsString.length > 2000) {
            const buffer = Buffer.from(resultsString);
            const attachment = new Discord.MessageAttachment(buffer, 'results.txt');
            await msg.channel.send(attachment);
        } else {
            await msg.channel.send(resultsString);
        }
    }
}

export default new SQL();