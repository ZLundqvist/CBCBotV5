import { ClientIntents } from '@constants';
import { DBGuildUtils } from '@db/guild';
import getLogger from '@utils/logger';
import Discord from 'discord.js';
import * as db from '../database/database';
import { Commands } from './commands';
import configuration from './configuration';
import { attachCustomEvents } from './custom-events';
import { Modules } from './modules';

const log = getLogger('Core');

const modules: Modules = new Modules();
const commands: Commands = new Commands();

export function getModulesHandler() {
    return modules;
}

export function getCommandsHandler() {
    return commands;
}

export async function start() {
    await db.createConnection();

    const client = new Discord.Client({
        intents: ClientIntents
    });

    attachListeners(client);
    attachCustomEvents(client);

    await client.login(Config.getConfigValue('token'));
}


function attachListeners(client: Discord.Client) {
    client.on('ready', async (client) => {
        await modules.init(client);
        await commands.init(client);
        await DBGuildUtils.addMissingGuilds(Array.from(client.guilds.cache.values()));
        log.info(`Connected to Discord and logged in as ${client.user?.tag}`);
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

async function gracefulShutdown(client: Discord.Client) {
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
