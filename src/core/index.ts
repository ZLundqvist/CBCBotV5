import Discord from 'discord.js';
import { ClientIntents } from '../constants';
import * as db from '../database/database';
import { DBGuildUtils } from '../database/entity/guild';
import getLogger from '../utils/logger';
import { Commands } from './commands';
import configuration from './configuration';
import { attachCustomEvents } from './custom-events';
import { Modules } from './modules';

const log = getLogger('core');

const modules: Modules = new Modules();
const commands: Commands = new Commands();

export function getModulesHandler(): Modules {
    return modules;
}

export function getCommandsHandler(): Commands {
    return commands;
}

export async function start(): Promise<void> {
    await db.createConnection();

    const client = new Discord.Client({
        intents: ClientIntents
    });

    attachListeners(client);
    attachCustomEvents(client);

    await client.login(Config.getConfigValue('token'));
}


function attachListeners(client: Discord.Client): void {
    client.on('ready', async (client) => {
        log.info(`Connected to Discord and logged in as ${client.user?.tag}`);
        await modules.init(client);
        await commands.init(client);
        await DBGuildUtils.addMissingGuilds(Array.from(client.guilds.cache.values()));
    });

    client.on('guildCreate', async (guild) => {
        await DBGuildUtils.addMissingGuilds([guild]);
    });

    process.once('SIGUSR2', async () => {
        await gracefulShutdown(client);
        process.exit();
    });

    process.once('SIGINT', async () => {
        await gracefulShutdown(client);
        process.exit();
    });

    process.once('SIGTERM', async () => {
        await gracefulShutdown(client);
        process.exit();
    });
}

async function gracefulShutdown(client: Discord.Client): Promise<void> {
    log.info('Performing graceful shutdown...');
    await db.closeConnection();
    log.info('Destroying client');
    client.destroy();
}

export * from './command-error';
export * from './custom-events';
export * from './global-command';
export * from './guild-command';
export * from './module';
export const Config = configuration;
