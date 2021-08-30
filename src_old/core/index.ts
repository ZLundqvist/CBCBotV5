import Discord from 'discord.js';
import getLogger from '../utils/logger';
import { Commands } from './commands';
import { attachCustomEvents } from './custom-events';
import { Modules } from './modules';
const log = getLogger(__dirname);

const commands: Commands = new Commands();
const modules: Modules = new Modules();

export async function init(client: Discord.Client) {
    log.info('Initializing core');
    attachCustomEvents(client);
    await modules.init(client);
    await commands.init(client);
}

export function getCommands(): Commands {
    return commands;
}
