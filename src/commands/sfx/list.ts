import { CommandError, GuildCommand } from "@core";
import { DBGuildUtils } from '@db/guild';
import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import audio from '@modules/audio';
import entrySound from '@modules/entry-sound';
import postureCheck from '@modules/posture-check';
import getLogger from '@utils/logger';
import { connectIfAloneOrDisconnected, inSameChannelAs, inVoiceChannel } from "@utils/voice";
import ResourceHandler from 'core/resource-handler';
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('sfx')
    .setDescription('List all SFXs');

class ListSFXCommand extends GuildCommand {
    constructor() {
        super(command, false, false);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
        const sfxs = ResourceHandler.getAllSFX();
        await interaction.reply(`SFXs:\n${codeBlock(sfxs.join(', '))}`);
    }
}

export default new ListSFXCommand();
