import { codeBlock, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { BotCore, GlobalCommand } from "../../core";

const listCommand = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('List all available SFXs');

const command = new SlashCommandBuilder()
    .setName('sfx')
    .setDescription('SFX related commands')
    .addSubcommand(listCommand);

class SFXCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), false, false);
    }

    async executeGlobalCommand(interaction: CommandInteraction): Promise<void> {
        const sfxs = BotCore.resources.getSFXs().map(sfx => sfx.name);
        await interaction.reply(codeBlock(sfxs.join(', ')));
    }
}

export default new SFXCommand();
