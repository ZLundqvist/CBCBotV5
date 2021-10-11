import { codeBlock, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CBCBotCore, GlobalCommand } from "../../core";

const listCommand = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('List all available SFXs');

const command = new SlashCommandBuilder()
    .setName('sfx')
    .setDescription('SFX related commands')
    .addSubcommand(listCommand);

class SFXCommand extends GlobalCommand {
    constructor() {
        super(command, false, false);
    }

    async executeGlobalCommand(interaction: CommandInteraction): Promise<void> {
        const sfxs = CBCBotCore.resources.getSFXNames();
        await interaction.reply(codeBlock(sfxs.join(', ')));
    }
}

export default new SFXCommand();
