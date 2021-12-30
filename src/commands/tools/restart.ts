import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCore, GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';

const command = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('[ADMIN] Restart the bot');

export default class RestartCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            ownerOnly: true,
            autoDefer: false
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        await context.interaction.reply('Restart coming up');
        BotCore.gracefulShutdown();
    }
}

