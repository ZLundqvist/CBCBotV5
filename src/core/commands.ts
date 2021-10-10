import { EmojiCharacters } from '@constants';
import { GlobalCommand, GuildCommand } from '@core';
import getLogger from '@utils/logger';
import { timeMeasurement } from '@utils/time';
import Discord, { Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { BaseCommand } from './base-command';
import { CommandError } from './command-error';

const log = getLogger('Core');
const COMMANDS_PATH = path.join(__dirname, '../commands/');

export class Commands {
    private commands: Collection<string, BaseCommand>;
    private client!: Discord.Client<true>;

    constructor() {
        this.commands = new Collection();
    }

    async init(client: Discord.Client<true>): Promise<void> {
        this.client = client;

        await this.importCommands();

        this.client.on('interactionCreate', (interaction) => {
            if(interaction.isCommand()) {
                this.onCommandInteractionCreate(interaction);
            }
        });

        await this.refreshCommandsIfNeeded();
    }

    async setCommandsInGuild(guild: Discord.Guild): Promise<void> {
        const commandData = this.getGuildCommands().map(cmd => cmd.toApplicationCommandData());
        await guild.commands.set(commandData);
        log.info(`Deployed ${commandData.length} commands to guild ${guild.name}`);
    }

    async clearCommandsInGuild(guild: Discord.Guild): Promise<void> {
        await guild.commands.set([]);
        log.info(`Commands cleared in guild ${guild.name}`);
    }

    getGuildCommands(): GuildCommand[] {
        return Array.from(this.commands.filter((cmd): cmd is GuildCommand => cmd instanceof GuildCommand).values());
    }

    getGlobalCommands(): GlobalCommand[] {
        return Array.from(this.commands.filter((cmd): cmd is GlobalCommand => cmd instanceof GlobalCommand).values());
    }

    async updateGuildCommandPermissions(guild: Discord.Guild, cmd: GuildCommand) {
        const id = await this.getGuildCommandIdByName(guild, cmd.name);
    }

    private async onCommandInteractionCreate(interaction: Discord.CommandInteraction): Promise<void> {
        const command = this.commands.get(interaction.commandName);

        if(!command) {
            log.warn(`Received CommandInteraction without matching command (commandName: ${interaction.commandName})`);
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
            } else if(error instanceof Error) {
                log.error(error);
                await replyFn(`${EmojiCharacters.deny} Internal error: **${error.message}**`);
            } else {
                log.error(error);
                await replyFn(`${EmojiCharacters.deny} Something went wrong`);
            }
        }
    }

    private async importCommands() {
        timeMeasurement.start('Command import');

        const commandFolders = fs.readdirSync(COMMANDS_PATH).filter(file => {
            const name = path.join(COMMANDS_PATH, file);
            return fs.lstatSync(name).isDirectory()
        });

        for(const commandFolder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(COMMANDS_PATH, commandFolder));

            for(const commandFile of commandFiles) {
                try {
                    await this.importCommand(path.join(COMMANDS_PATH, commandFolder, commandFile));
                } catch(error) {
                    if(error instanceof Error) {
                        log.error(`Error importing command from file '${commandFile}' (${error.message})`);
                    }
                }
            }
        }

        timeMeasurement.end('Command import', log);
        log.info(`Imported ${this.commands.size} commands`);
    }

    private async importCommand(path: string) {
        const command = (await import(path)).default;

        if(!(command instanceof BaseCommand)) {
            throw new Error('Not instance of BaseCommand');
        }

        if(this.commands.has(command.name)) {
            throw new Error(`Duplicate command name: ${command.name}`);
        }

        if(command instanceof GuildCommand) {
            log.info(`Importing GuildCommand: ${command.name}`);
        } else if(command instanceof GlobalCommand) {
            log.info(`Importing GlobalCommand: ${command.name}`);
        } else {
            throw new Error('Encountered unknown instance');
        }

        this.commands.set(command.name, command);
    }

    async refreshCommandsIfNeeded() {
        const guilds = await this.client.guilds.fetch();
        for(const oAuthGuild of guilds.values()) {
            const guild = await oAuthGuild.fetch();
            if(await this.isCommandRefreshNeeded(guild)) {
                log.info(`Command refresh needed in guild ${guild.name}`);
                await this.setCommandsInGuild(guild);
            } else {
                log.info(`Commands are up to date in guild ${guild.name}`);
            }
        }
    }



    private async isCommandRefreshNeeded(guild: Discord.Guild): Promise<boolean> {
        const commands = this.commands;
        const deployedCommands = await guild.commands.fetch();

        const commandNames = Array.from(commands.mapValues(cmd => cmd.name).values());
        const deployedCommandNames = Array.from(deployedCommands.mapValues(cmd => cmd.name).values());

        if(commandNames.length !== deployedCommandNames.length) {
            return true;
        }

        for(const commandName of commandNames) {
            if(!deployedCommandNames.includes(commandName)) {
                return true;
            }
        }

        return false;
    }

    private async getGuildCommandIdByName(guild: Discord.Guild, name: string) {
        const commands = await guild.commands.fetch();
        return commands.find((cmd) => {
            return cmd.name === name;
        });
    }


}
