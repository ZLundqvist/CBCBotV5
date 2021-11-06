
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { GlobalCommand } from '../../core';
import Fysiken from '../../modules/fysiken';

const command = new SlashCommandBuilder()
    .setName('fysiken')
    .setDescription('See visitor count or setup notification threshold')
    .addIntegerOption(option => {
        return option
            .setName('threshold')
            .setDescription('Notification threshold');
    });


class FysikenCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), false, false);
    }

    async executeGlobalCommand(interaction: CommandInteraction) {
        const threshold = interaction.options.getInteger('threshold', false);

        if(threshold) {
            Fysiken.setThresholdForUser(interaction.user, threshold);
            await interaction.reply('noted');
        } else {
            const current = await Fysiken.getCurrentValue();
            await interaction.reply(`${current} peeps @ Fysiken`);
        }
    }
}

export default new FysikenCommand();
