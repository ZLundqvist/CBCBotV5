import { codeBlock, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { GuildCommand } from "../../core";
import ResourceHandler from '../../core/resource-handler';
import getLogger from '../../utils/logger';

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
