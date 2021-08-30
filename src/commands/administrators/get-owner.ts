import Discord from 'discord.js';
import { Command } from "../../core/command";
import config from '../../utils/config';
import { CommandError } from '../../core/command-error';

const name = 'GetOwner';
const keywords = [ 'owner' ];
const description = 'Returns owner of bot.';

class GetOwner extends Command {
    constructor() {
        super(name, keywords, description, false, false);
    }

    async execute(msg: Discord.Message, ...args: string[]): Promise<void> {
        const ownerId = config.getConfigValue('owner-id');

        if(!ownerId) {
            throw new CommandError('Owner not set in config');
        }

        try {
            let ownerUser = await msg.client.users.fetch(ownerId);
            await msg.channel.send(`Owner is: ${ownerUser}`);
        } catch {
            throw new CommandError(`${ownerId} is not a valid user. Check the config.`);
        }
    }
}

export default new GetOwner();