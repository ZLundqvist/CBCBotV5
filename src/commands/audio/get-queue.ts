import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { GuildCommand } from "../../core";
import audio from '../../modules/audio';

const command = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Get current queue');

class GetQueueCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), false, true);
    }

    async executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        const embed = await audio.getGuildAudio(guild).getQueueEmbed();
        await interaction.editReply({ embeds: [embed] });
    }
}

export default new GetQueueCommand();
