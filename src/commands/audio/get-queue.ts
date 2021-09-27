import { GuildCommand } from "@core";
import { SlashCommandBuilder } from '@discordjs/builders';
import audio from '@modules/audio';
import getLogger from '@utils/logger';
import Discord, { CommandInteraction } from 'discord.js';

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
