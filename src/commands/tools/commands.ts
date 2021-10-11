import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CBCBotCore, GlobalCommand } from "../../core";

const refreshCommand = new SlashCommandSubcommandBuilder()
    .setName('refresh')
    .setDescription('[ADMIN] Refresh the bot-commands');

const command = new SlashCommandBuilder()
    .setName('commands')
    .setDescription('Handle command deployment')
    .addSubcommand(refreshCommand);


class CommandsCommand extends GlobalCommand {
    constructor() {
        super(command, true, false);
    }

    async executeGlobalCommand(interaction: CommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch(subcommand) {
            case 'refresh':
                await this.refresh(interaction);
                break;
        }
    }

    private async refresh(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const commandsHandler = CBCBotCore.commands;

        try {
            for(const guild of interaction.client.guilds.cache.values()) {
                await commandsHandler.deployGuildCommands(guild);
            }

            await commandsHandler.deployGlobalCommands();

            await interaction.editReply('Commands refreshed!');
        } catch(error: any) {
            await interaction.editReply(`Error refreshing commands: ${error.message}`);
        }
    }
}

export default new CommandsCommand();
