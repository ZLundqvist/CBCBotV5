import { CommandError, GuildCommand } from "@core";
import { DBGuildUtils } from '@db/guild';
import { SlashCommandBuilder } from '@discordjs/builders';
import audio from '@modules/audio';
import entrySound from '@modules/entry-sound';
import postureCheck from '@modules/posture-check';
import getLogger from '@utils/logger';
import { connectIfAloneOrDisconnected, inSameChannelAs, inVoiceChannel } from "@utils/voice";
import ResourceHandler from 'core/resource-handler';
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('pc')
    .setDescription('Enable/disable posture check')
    .addIntegerOption((option) => {
        return option
            .setName('interval')
            .setDescription('Posture check interval in minutes. 0 to disable.')
            .setRequired(true);
    });

class PostureCheckCommand extends GuildCommand {
    constructor() {
        super(command, false, false);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
        const input = interaction.options.getInteger('interval', true);

        if(input === 0) {
            postureCheck.disable(guild);
            await interaction.reply('Posture check disabled');
        } else if(input > 0) {
            await postureCheck.enable(guild, input);
            await interaction.reply(`Posture check enabled (${input}-minute interval)`);
        } else {
            await interaction.reply('Interval cannot be negative.');
        }
    }
}

export default new PostureCheckCommand();
