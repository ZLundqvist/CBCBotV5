import { EmojiCharacters } from '@constants';
import { serializeCommands } from '@utils/command-deployment';
import getLogger from '@utils/logger';
import { measure } from '@utils/time';
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

    async init(client: Discord.Client<true>) {
        this.client = client;
        measure.start('Command import');

        await this.importCommands();
        this.attachInteractionListener();

        measure.end('Command import', log);

        await this.refreshCommandsIfNeeded();
    }

    private async onCommandInteractionCreate(interaction: Discord.CommandInteraction) {
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

    private attachInteractionListener() {
        this.client.on('interactionCreate', (interaction) => {
            if(interaction.isCommand()) {
                this.onCommandInteractionCreate(interaction);
            }
        });
    }

    private async importCommands() {
        const commandFolders = fs.readdirSync(COMMANDS_PATH).filter(file => {
            const name = path.join(COMMANDS_PATH, file);
            return fs.lstatSync(name).isDirectory()
        });

        for(const commandFolder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(COMMANDS_PATH, commandFolder));

            for(const commandFile of commandFiles) {
                const command = (await import(path.join(COMMANDS_PATH, commandFolder, commandFile))).default;

                if(command instanceof BaseCommand) {
                    this.commands.set(command.name, command);
                } else {
                    log.warn(`${commandFile} does not export an instance of BaseCommand. Skipping import.`);
                }
            }
        }

        log.info(`Imported ${this.commands.size} commands`);
    }

    async refreshCommandsIfNeeded() {
        for(const guild of this.client.guilds.cache.values()) {
            if(await this.isCommandRefreshNeeded(guild)) {
                log.info(`Command refresh needed in guild ${guild.name}`);
                await this.clearCommandsInGuild(guild);
                await this.setCommandsInGuild(guild);
            } else {
                log.info(`Commands are up to date in guild ${guild.name}`);
            }
        }
    }

    async setCommandsInGuild(guild: Discord.Guild) {
        const serializedCommands = serializeCommands(this.commands);
        await guild.commands.set(serializedCommands);
        log.info(`Deployed ${serializedCommands.length} commands to guild ${guild.name}`);
    }

    async clearCommandsInGuild(guild: Discord.Guild) {
        await guild.commands.set([]);
        log.info(`Commands cleared in guild ${guild.name}`);
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
}
