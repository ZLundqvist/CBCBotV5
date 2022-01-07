import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { BotCore, GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';
import { OwnerOnlyPrecondition } from '../../preconditions';

const refreshCommand = new SlashCommandSubcommandBuilder()
    .setName('refresh')
    .setDescription('[ADMIN] Refresh the bot-commands');

const command = new SlashCommandBuilder()
    .setName('commands')
    .setDescription('Handle command deployment')
    .addSubcommand(refreshCommand);

export default class CommandsCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: false,
            preconditions: [
                new OwnerOnlyPrecondition()
            ]
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        const subcommand = context.interaction.options.getSubcommand();

        switch(subcommand) {
            case 'refresh':
                await this.refresh(context);
                break;
        }
    }

    private async refresh(context: RunCommandContext) {
        await context.interaction.deferReply({ ephemeral: true });

        try {
            for(const guild of context.interaction.client.guilds.cache.values()) {
                await BotCore.commands.deployGuildCommands(guild);
            }

            await BotCore.commands.deployGlobalCommands();

            await context.interaction.editReply('Commands refreshed!');
        } catch(error: any) {
            await context.interaction.editReply(`Error refreshing commands: ${error.message}`);
        }
    }
}
