import Discord from 'discord.js';
import path from 'path';
import 'reflect-metadata';
import { getConnection } from 'typeorm';
import { init } from './core';
import ResourceHandler from './core/resource-handler';
import { addGuilds, connectDB } from './database/database';
import config from './utils/config';
import getLogger from './utils/logger';
import dotenv from 'dotenv';
import { getEnv, isDev } from './utils/utils';

const log = getLogger(__filename);
dotenv.config();

log.info(`Starting CBCBotV4 ${getEnv('npm_package_version') || getEnv('version')}`);
ResourceHandler.init(path.resolve('./resources'));

const client = new Discord.Client({
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_BANS',
        'GUILD_EMOJIS_AND_STICKERS',
        'GUILD_INTEGRATIONS',
        'GUILD_WEBHOOKS',
        'GUILD_INVITES',
        'GUILD_VOICE_STATES',
        'GUILD_PRESENCES',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS'
    ]
});

async function main() {
    try {
        await connectDB();
        await init(client);
        await connectBot();
    } catch (e) {
        log.fatal(e);
        process.exit(1);
    }
}

async function connectBot() {
    log.trace('connectBot');
    await client.login(config.getConfigValue('token'));
}

client.on('ready', async () => {
    log.info(`Connected to Discord and logged in as ${client.user?.tag}`);
    await addGuilds(Array.from(client.guilds.cache.values()));
    client.emit('readyWithClient' as any, client);
});

client.on('guildCreate', async (guild) => {
    await addGuilds([ guild ]);
});

process.once('SIGUSR2', async () => {
    await gracefulShutdown();
    process.exit();
});

process.on('SIGINT', async () => {
    await gracefulShutdown();
    process.exit();
});

async function gracefulShutdown() {
    log.info('Shutdown...');

    let conn = getConnection();
    if(conn) {
        log.info('Closing database connection');
        await conn.close();
    }
    
	if (client.uptime) {
		log.info('Destroying client');
		client.destroy();
	}
}

main();
