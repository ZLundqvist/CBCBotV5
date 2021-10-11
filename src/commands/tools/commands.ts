import { getCommandsHandler, GuildCommand } from "@core";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import getLogger from '@utils/logger';
import { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

const refreshCommand = new SlashCommandSubcommandBuilder()
    .setName('refresh')
    .setDescription('Refresh the commands');

const command = new SlashCommandBuilder()
    .setName('commands')
    .setDescription('Handle command deployment')
    .setDefaultPermission(false)
    .addSubcommand(refreshCommand);


class AliasCommand extends GuildCommand {
    constructor() {
        super(command, true, false);
    }

    async execute(interaction: CommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch(subcommand) {
            case 'refresh':
                await this.refresh(interaction);
                break;
        }
    }

    private async refresh(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const commandsHandler = getCommandsHandler();

        try {
            for(const guild of interaction.client.guilds.cache.values()) {
                await commandsHandler.setGuildCommands(guild);
            }

            await commandsHandler.setApplicationCommands();

            await interaction.editReply('Commands refreshed!');
        } catch (error: any) {
            await interaction.editReply(`Error refreshing commands: ${error.message}`);
        }
    }
}

export default new AliasCommand();
