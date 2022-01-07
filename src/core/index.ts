import Discord from 'discord.js';
import { Configuration } from '../configuration';
import { ClientIntents } from '../constants';
import { Database } from '../database/database';
import { Resources } from '../resources';
import { getLoggerWrapper } from '../utils/logger';
import { logVoiceStateUpdate } from '../utils/voice';
import { CommandHandler } from './command-handler';
import { ModuleHandler } from './module-handler';

class CBCBotCore {
    private readonly log = getLoggerWrapper('core');

    readonly client: Discord.Client;
    readonly modules: ModuleHandler;
    readonly commands: CommandHandler;

    readonly database: Database = new Database('cbcbotv5');
    readonly config: Configuration = new Configuration('config.json');
    readonly resources: Resources = new Resources('resources');

    constructor() {
        this.client = new Discord.Client({ intents: ClientIntents });
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

        this.attachDiscordListeners();
        this.attachProcessListeners();

        await this.client.login(this.config.getValue('token'));
    }

    async gracefulShutdown(): Promise<void> {
        this.log.info('Performing graceful shutdown');

        await this.modules.destroy();
        await this.database.closeConnection();
        this.client.destroy();

        this.log.info('Cleanup complete, exiting...');
        process.exit(0);
    }

    private async onClientReady(client: Discord.Client<true>): Promise<void> {
        this.log.info(`Connected to Discord and logged in as ${client.user.tag}`);
        await this.modules.init();
        await this.commands.init();
        await this.database.addMissingGuilds(Array.from(client.guilds.cache.values()));
    }

    private async onGuildCreated(guild: Discord.Guild): Promise<void> {
        this.log.info(`Received guildCreate event (guildId: ${guild.id}, guildName: ${guild.name})`);
        await this.database.addMissingGuilds([guild]);
        await this.commands.deployGuildCommands(guild);
    }

    private attachDiscordListeners(): void {
        this.client.once('ready', this.onClientReady.bind(this));
        this.client.on('guildCreate', this.onGuildCreated.bind(this));
        this.client.on('voiceStateUpdate', logVoiceStateUpdate);
    }

    private attachProcessListeners(): void {
        process.once('SIGINT', this.gracefulShutdown.bind(this));
        process.once('SIGTERM', this.gracefulShutdown.bind(this));
    }
}

export const BotCore = new CBCBotCore();
export * from './custom-errors';
export * from './global-command';
export * from './guild-command';
export * from './module';
export * from './precondition';

