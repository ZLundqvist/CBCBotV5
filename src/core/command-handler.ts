import assert from 'assert';
import Discord from 'discord.js';
import path from 'path';
import { BotCore, CommandError, GlobalCommand, GuildCommand, PreconditionError } from '.';
import { EmojiCharacters } from '../constants';
import { getFilesRecursive } from '../utils/file';
import { getLoggerWrapper } from '../utils/logger';
import { Command } from './command';
import { ImportError } from './custom-errors';

const COMMANDS_PATH = path.join(__dirname, '../commands/');

export class CommandHandler {
    private readonly log = getLoggerWrapper('core');
    private readonly commands: Discord.Collection<string, Command> = new Discord.Collection();
    private readonly client: Discord.Client;

    constructor(client: Discord.Client) {
        this.client = client;
    }

    async init(): Promise<void> {
        assert(this.client.isReady());

        await this.registerCommands();

        if(BotCore.config.getNodeEnv() === 'production') {
            await this.deployCommands();
        }

        this.client.on('interactionCreate', this.onInteractionCreate.bind(this));
    }

    async deployCommands(): Promise<void> {
        await this.deployGlobalCommands();

        for(const guild of this.client.guilds.cache.values()) {
            await this.deployGuildCommands(guild);
        }
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

    private async onInteractionCreate(interaction: Discord.Interaction): Promise<void> {
        if(!interaction.isCommand()) {
            return;
        }

        const command = this.commands.get(interaction.commandName);

        if(!command) {
            this.log.warn(`Received CommandInteraction without matching command (commandName: ${interaction.commandName})`);
            await interaction.reply('Command has not been registered. Update list of commands using /commands refresh');
            return;
        }

        try {
            await command.run(interaction);
        } catch(error) {
            const smartReplyFn = async (msg: string) => {
                if(interaction.replied || interaction.deferred) {
                    await interaction.editReply(msg);
                } else {
                    await interaction.reply(msg);
                }
            };

            if(error instanceof CommandError) {
                await smartReplyFn(`${EmojiCharacters.deny} **${error.message}**`);
            } else if(error instanceof PreconditionError) {
                await smartReplyFn(`${EmojiCharacters.deny} **${error.message}**`);
            } else {
                this.log.error(error);
                await smartReplyFn(`${EmojiCharacters.deny} Something went wrong`);
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

    private isBaseCommand(object: any): object is new () => Command {
        return typeof object === 'function' && object.prototype instanceof Command;
    }
}
