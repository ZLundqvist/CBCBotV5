import { Command } from "../../core/command";
import Discord from 'discord.js';
import alias from "../../modules/alias";
import getLogger from "../../utils/logger";
import { CommandError } from "../../core/command-error";

const log = getLogger(__filename);

const name = 'AddAlias';
const keywords = [ 'alias add' ];
const description = '<key> -> <value>. Add alias to guild.';
const separator = '->';

interface ExtractedAlias {
    key?: string;
    value?: string;
};

class ListAlias extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.guild)
            return;

        const { key, value } = extractAlias(msg.content);

        if(!key || !value) {
            return;
        }

        let created = await alias.addInGuild(msg.guild, key, value);

        msg.channel.send(`Alias ${created.key} added with value ${created.value}`);
    }
}

export default new ListAlias();

function extractAlias(msg: string): ExtractedAlias {
    const result: ExtractedAlias = {};

    const split = msg.split(separator).map(part => part.trim());

    if(split.length === 1) {
        throw new CommandError(`separate key and value with a '${separator}'`);
    }

    if(split.length === 2) {
        result.value = split[1];

        let keySplit = split[0].split(' ');
        let key = keySplit[keySplit.length - 1].trim();

        result.key = key;
    }

    return result;
}