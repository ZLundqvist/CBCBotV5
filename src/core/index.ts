import Discord from 'discord.js';
import { Configuration } from '../configuration';
import { ClientIntents } from '../constants';
import { Database } from '../database/database';
import { Resources } from '../resources';
import { getLoggerWrapper } from '../utils/logger';
import { CommandHandler } from './command-handler';
import { attachCustomEvents } from './custom-events';
import { ModuleHandler } from './module-handler';

class CBCBotCore {
    private readonly log = getLoggerWrapper('core');

    readonly client: Discord.Client;
    readonly database: Database;
    readonly config: Configuration;
    readonly resources: Resources;
    readonly modules: ModuleHandler;
    readonly commands: CommandHandler;

    constructor() {
        this.client = new Discord.Client({ intents: ClientIntents });
        this.database = new Database('cbcbotv5');
        this.config = new Configuration('config.json');
        this.resources = new Resources('resources');
        this.modules = new ModuleHandler(this.client);
        this.commands = new CommandHandler(this.client);

        this.log.info('Starting CBCBotV5');
        this.log.info(`Version: ${this.config.getVersion()}`);
        this.log.info(`Running in ${this.config.getNodeEnv()} mode`);
    }

    async start() {
        this.resources.setup();
        this.config.loadAndValidate();
        await this.database.createConnection();

        // Attach various listeners
        this.client.on('ready', async (client) => {
            this.log.info(`Connected to Discord and logged in as ${client.user?.tag}`);
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
        this.log.info('Performing graceful shutdown');

        await this.modules.destroy();
        await this.database.closeConnection();

        this.client.destroy();
        this.log.info('Client destroyed');

        process.exit(0);
    }
}

export const BotCore = new CBCBotCore();
export * from './custom-errors';
export * from './custom-events';
export * from './global-command';
export * from './guild-command';
export * from './module';
export * from './precondition';

