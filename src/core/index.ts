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
    private readonly client: Discord.Client<true> = new Discord.Client({ intents: ClientIntents });
    readonly database: Database = new Database('cbcbotv5');
    readonly config: Configuration = new Configuration('config.json');
    readonly resources: ResourceHandler = new ResourceHandler('resources');
    readonly modules: ModuleHandler = new ModuleHandler();
    readonly commands: CommandHandler = new CommandHandler();

    constructor() {
        log.info('Starting CBCBotV5');
        log.info(`Version: ${this.config.getVersion()}`);
        log.info(`Running in ${this.config.getNodeEnv()} mode`);
    }

    async start() {
        this.resources.setup();
        this.config.loadAndValidate();
        await this.database.createConnection();

        // Attach various listeners
        this.client.on('ready', async (client) => {
            log.info(`Connected to Discord and logged in as ${client.user?.tag}`);
            await this.modules.init(client);
            await this.commands.init(client);
            await this.database.addMissingGuilds(Array.from(client.guilds.cache.values()));
        });

        this.client.on('guildCreate', async (guild) => {
            await this.database.addMissingGuilds([guild]);
            await this.commands.deployGuildCommands(guild);
        });

        process.once('SIGUSR2', async () => {
            await this.gracefulShutdown();
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
