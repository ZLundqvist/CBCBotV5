import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { GuildCommand } from "../../core";
import audio from '../../modules/audio';
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Get current queue');

class GetQueueCommand extends GuildCommand {
    constructor() {
        super(command, false, false);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        const embed = audio.getGuildAudio(guild).getQueueEmbed();

        await interaction.reply({
            embeds: [embed]
        });
    }
}

export default new GetQueueCommand();
