import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import Discord, { CommandInteraction } from 'discord.js';
import { GuildCommand } from "../../core";
import postureCheck from '../../modules/posture-check';

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
        super(command.toJSON(), false, false);
    }

    async executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
        const input = interaction.options.getInteger('interval', true);

        const vc = getVoiceConnection(guild.id);
        if(!vc) {
            await interaction.reply('I must be in a voice channel first');
            return;
        }


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
