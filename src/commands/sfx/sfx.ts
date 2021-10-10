import { GuildCommand } from "@core";
import { codeBlock, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import getLogger from '@utils/logger';
import ResourceHandler from 'core/resource-handler';
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger('SFX');

const listCommand = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('List all available SFXs');

const command = new SlashCommandBuilder()
    .setName('sfx')
    .setDescription('SFX related commands')
    .addSubcommand(listCommand);

class ListSFXCommand extends GuildCommand {
    constructor() {
        super(command, false, false);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
        const sfxs = ResourceHandler.getAllSFX();
        await interaction.reply(codeBlock(sfxs.join(', ')));
    }
}

export default new ListSFXCommand();
