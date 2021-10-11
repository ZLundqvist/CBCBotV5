import Discord from 'discord.js';
import { ClientIntents } from '../constants';
import { Database } from '../database/database';
import getLogger from '../utils/logger';
import { Commands } from './commands';
import { Configuration } from './configuration';
import { attachCustomEvents } from './custom-events';
import { Modules } from './modules';
import { ResourceHandler } from './resource-handler';

const log = getLogger('core');

class BotCore {
    private readonly _client: Discord.Client<true> = new Discord.Client({ intents: ClientIntents });
    private readonly _database: Database = new Database('cbcbotv5');
    private readonly _config: Configuration = new Configuration();
    private readonly _resources: ResourceHandler = new ResourceHandler();
    private readonly _modules: Modules = new Modules();
    private readonly _commands: Commands = new Commands();

    public get client(): Discord.Client<true> { return this._client; }
    public get database(): Database { return this._database; }
    public get config(): Configuration { return this._config; }
    public get resources(): ResourceHandler { return this._resources; }
    public get modules(): Modules { return this._modules; }
    public get commands(): Commands { return this._commands; }

    constructor() {
        log.info('Starting CBCBotV5');
        log.info(`Version: ${this.config.getEnv('npm_package_version') || this.config.getEnv('version')}`);
        log.info(`Running in ${this.config.getNodeEnv()} mode`);
    }

    async start() {
        this.config.validate();
        this.resources.setup();
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

        await this.client.login(this.config.getConfigValue('token'));
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

export const CBCBotCore = new BotCore();
export * from './custom-errors';
export * from './custom-events';
export * from './global-command';
export * from './guild-command';
export * from './module';
