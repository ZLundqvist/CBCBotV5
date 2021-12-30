import { codeBlock, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { BotCore, GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';

const listCommand = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('List all available SFXs');

const command = new SlashCommandBuilder()
    .setName('sfx')
    .setDescription('SFX related commands')
    .addSubcommand(listCommand);

export default class SFXCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: false
        });
    }

    async runGlobalCommand(context: RunCommandContext): Promise<void> {
        const sfxs = BotCore.resources.getSFXs().map(sfx => sfx.name);
        await context.interaction.reply(codeBlock(sfxs.join(', ')));
    }
}
