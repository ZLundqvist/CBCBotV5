
import { SlashCommandBuilder } from '@discordjs/builders';
import { GlobalCommand } from '../../core';
import { RunCommandContext } from '../../core/command';
import Fysiken from '../../modules/fysiken';

const command = new SlashCommandBuilder()
    .setName('fysiken')
    .setDescription('See visitor count or setup notification threshold')
    .addIntegerOption(option => {
        return option
            .setName('threshold')
            .setDescription('Notification threshold');
    });


export default class FysikenCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: false
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        const threshold = context.interaction.options.getInteger('threshold', false);

        if(threshold) {
            Fysiken.setThresholdForUser(context.interaction.user, threshold);
            await context.interaction.reply('noted');
        } else {
            const current = await Fysiken.getCurrentValue();
            await context.interaction.reply(`${current} peeps @ Fysiken`);
        }
    }
}

