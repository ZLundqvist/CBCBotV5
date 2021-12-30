import assert from 'assert';
import Discord, { Collection } from 'discord.js';
import path from 'path';
import { CommandError, GlobalCommand, GuildCommand } from '.';
import { EmojiCharacters } from '../constants';
import { getFilesRecursive } from '../utils/file';
import { getLoggerWrapper } from '../utils/logger';
import { BaseCommand } from './base-command';
import { ImportError } from './custom-errors';

const COMMANDS_PATH = path.join(__dirname, '../commands/');

export class CommandHandler {
    private readonly log = getLoggerWrapper('core');
    private readonly commands: Collection<string, BaseCommand>;
    private readonly client: Discord.Client;

    constructor(client: Discord.Client) {
        this.commands = new Collection();
        this.client = client;
    }

    async init(): Promise<void> {
        assert(this.client.isReady());

        await this.registerCommands();

        this.client.on('interactionCreate', (interaction) => {
            if(interaction.isCommand()) {
                this.onCommandInteractionCreate(interaction);
            }
        });

        await this.ensureCommandsUpdated();
    }

    async deployGlobalCommands(): Promise<void> {
        assert(this.client.isReady());
        const commandData = this.getGlobalCommands().map(cmd => cmd.commandData);
        await this.client.application.commands.set(commandData);
        this.log.info(`Deployed ${commandData.length} application commands`);
    }

    async deployGuildCommands(guild: Discord.Guild): Promise<void> {
        const commandData = this.getGuildCommands().map(cmd => cmd.commandData);
        await guild.commands.set(commandData);
        this.log.info(`Deployed ${commandData.length} commands to guild ${guild.name}`);
    }

    getGuildCommands(): GuildCommand[] {
        return Array.from(this.commands.filter((cmd): cmd is GuildCommand => cmd instanceof GuildCommand).values());
    }

    getGlobalCommands(): GlobalCommand[] {
        return Array.from(this.commands.filter((cmd): cmd is GlobalCommand => cmd instanceof GlobalCommand).values());
    }

    private async onCommandInteractionCreate(interaction: Discord.CommandInteraction): Promise<void> {
        const command = this.commands.get(interaction.commandName);

        if(!command) {
            this.log.warn(`Received CommandInteraction without matching command (commandName: ${interaction.commandName})`);
            await interaction.reply('Command has not been registered. Update list of commands using /commands refresh');
            return;
        }

        try {
            await command.onInteraction(interaction);
        } catch(error) {
            const replyFn = async (msg: string) => {
                if(interaction.replied || interaction.deferred) {
                    await interaction.editReply(msg);
                } else {
                    await interaction.reply(msg);
                }
            };

            if(error instanceof CommandError) {
                await replyFn(`${EmojiCharacters.deny} **${error.message}**`);
            } else {
                this.log.error(error);
                await replyFn(`${EmojiCharacters.deny} Something went wrong`);
            }
        }
    }

    private async registerCommands(): Promise<void> {
        this.log.time('Command import');

        const filePaths = getFilesRecursive(COMMANDS_PATH);

        for(const filePath of filePaths) {
            try {
                await this.registerCommand(filePath);
            } catch(error) {
                if(error instanceof ImportError) {
                    this.log.error(`Error importing command from file '${filePath}' (${error.message})`);
                } else {
                    throw error;
                }
            }
        }

        this.log.timeEnd('Command import');
        this.log.info(`Imported ${this.commands.size} commands`);
    }

    private async registerCommand(path: string): Promise<void> {
        const defaultExport = (await import(path)).default;

        // Check that the import is a BaseCommand
        if(!this.isBaseCommand(defaultExport)) {
            throw new ImportError('Default export is not a BaseCommand');
        }

        const instance = new defaultExport();

        if(this.commands.has(instance.name)) {
            throw new ImportError(`Duplicate command name: ${instance.name}`);
        }

        if(instance instanceof GuildCommand) {
            this.log.debug(`Importing GuildCommand: ${instance.name}`);
        } else if(instance instanceof GlobalCommand) {
            this.log.debug(`Importing GlobalCommand: ${instance.name}`);
        } else {
            throw new ImportError('Encountered unknown instance');
        }

        this.commands.set(instance.name, instance);
    }

    private isBaseCommand(object: any): object is new () => BaseCommand {
        return typeof object === 'function' && object.prototype instanceof BaseCommand;
    }

    /**
     * Ensures that the application and all guilds have up-to-date commands
     */
    private async ensureCommandsUpdated(): Promise<void> {
        // Check for all guilds
        const guilds = this.client.guilds.cache.values();
        for(const guild of guilds) {
            if(await this.guildCommandsDiffer(guild)) {
                this.log.debug(`GuildCommand re-deploy needed in guild ${guild.name}`);
                await this.deployGuildCommands(guild);
            } else {
                this.log.debug(`GuildCommands are up to date in guild ${guild.name}`);
            }
        }

        // Check for application commands
        if(await this.globalCommandsDiffer()) {
            this.log.debug('GlobalCommand re-deploy needed');
            await this.deployGlobalCommands();
        } else {
            this.log.debug('GlobalCommands are up to date');
        }
    }

    private async globalCommandsDiffer(): Promise<boolean> {
        assert(this.client.isReady());
        const localCommandNames = this.getGlobalCommands().map(cmd => cmd.name);
        const deployedCommands = await this.client.application.commands.fetch();
        const deployedCommandNames = Array.from(deployedCommands.mapValues(cmd => cmd.name).values());

        return this.commandNamesDiffer(localCommandNames, deployedCommandNames);
    }

    private async guildCommandsDiffer(guild: Discord.Guild): Promise<boolean> {
        const localCommandNames = this.getGuildCommands().map(cmd => cmd.name);
        const deployedCommands = await guild.commands.fetch();
        const deployedCommandNames = Array.from(deployedCommands.mapValues(cmd => cmd.name).values());

        return this.commandNamesDiffer(localCommandNames, deployedCommandNames);
    }

    /**
     * Basic comparison of two lists of command names
     * Just a basic comparison
     * @param localCommandNames 
     * @param deployedCommandNames 
     * @returns True if lists differ, false otherwise
     */
    private async commandNamesDiffer(localCommandNames: string[], deployedCommandNames: string[]) {
        if(localCommandNames.length !== deployedCommandNames.length) {
            return true;
        }

        for(const commandName of localCommandNames) {
            if(!deployedCommandNames.includes(commandName)) {
                return true;
            }
        }

        return false;
    }
}
