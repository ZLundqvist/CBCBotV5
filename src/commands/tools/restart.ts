import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { BotCore, GlobalCommand } from "../../core";

const command = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('[ADMIN] Restart the bot');

class RestartCommand extends GlobalCommand {
    constructor() {
        super(command, true, false);
    }

    async executeGlobalCommand(interaction: CommandInteraction) {
        await interaction.reply('Restart coming up');
        BotCore.gracefulShutdown();
    }
}

export default new RestartCommand();
