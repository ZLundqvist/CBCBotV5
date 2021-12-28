import assert from 'assert';
import Discord from 'discord.js';
import { ClientIntents } from '../constants';
import { Database } from '../database/database';
import getLogger from '../utils/logger';
import { CommandHandler } from './command-handler';
import { Configuration } from './configuration';
import { attachCustomEvents } from './custom-events';
import { ModuleHandler } from './module-handler';
import { ResourceHandler } from './resource-handler';

const log = getLogger('core');

class CBCBotCore {
    private readonly client: Discord.Client = new Discord.Client({ intents: ClientIntents });
    readonly database: Database = new Database('cbcbotv5');
    readonly config: Configuration = new Configuration('config.json');
    readonly resources: ResourceHandler = new ResourceHandler('resources');

    private _moduleHandler?: ModuleHandler;
    private _commandHandler?: CommandHandler;

    constructor() {
        log.info('Starting CBCBotV5');
        log.info(`Version: ${this.config.getVersion()}`);
        log.info(`Running in ${this.config.getNodeEnv()} mode`);
    }

    get modules(): ModuleHandler {
        if(this._moduleHandler) {
            return this._moduleHandler;
        }
        assert(this.client.isReady(), 'Cannot access ModuleHandler before client is ready.');
        this._moduleHandler = new ModuleHandler(this.client);
        return this._moduleHandler;
    }

    get commands(): CommandHandler {
        if(this._commandHandler) {
            return this._commandHandler;
        }
        assert(this.client.isReady(), 'Cannot access CommandHandler before client is ready.');
        this._commandHandler = new CommandHandler(this.client);
        return this._commandHandler;
    }

    async start() {
        this.resources.setup();
        this.config.loadAndValidate();
        await this.database.createConnection();

        // Attach various listeners
        this.client.on('ready', async (client) => {
            log.info(`Connected to Discord and logged in as ${client.user?.tag}`);
            await this.modules.init();
            await this.commands.init();
            await this.database.addMissingGuilds(Array.from(client.guilds.cache.values()));
        });

        this.client.on('guildCreate', async (guild) => {
            await this.database.addMissingGuilds([guild]);
            await this.commands.deployGuildCommands(guild);
        });

        process.once('SIGINT', async () => {
            await this.gracefulShutdown();
        });

        process.once('SIGTERM', async () => {
            await this.gracefulShutdown();
        });

        attachCustomEvents(this.client);

        await this.client.login(this.config.getValue('token'));
    }

    async gracefulShutdown(): Promise<void> {
        log.info('Performing graceful shutdown');

        await this.modules.destroy();
        await this.database.closeConnection();

        this.client.destroy();
        log.info('Client destroyed');

        process.exit(0);
    }
}

export const BotCore = new CBCBotCore();
export * from './custom-errors';
export * from './custom-events';
export * from './global-command';
export * from './guild-command';
export * from './module';
