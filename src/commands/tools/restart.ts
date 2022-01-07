import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCore, GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';
import { OwnerOnlyPrecondition } from '../../preconditions';

const command = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('[ADMIN] Restart the bot');

export default class RestartCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: false,
            preconditions: [
                new OwnerOnlyPrecondition()
            ]
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        await context.interaction.reply('Restart coming up');
        BotCore.gracefulShutdown();
    }
}

