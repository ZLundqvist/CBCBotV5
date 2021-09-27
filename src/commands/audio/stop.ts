import { CommandError, GuildCommand } from "@core";
import { SlashCommandBuilder } from '@discordjs/builders';
import audio from '@modules/audio';
import getLogger from '@utils/logger';
import { inSameChannelAs } from "@utils/voice";
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playing audio');

class StopCommand extends GuildCommand {
    constructor() {
        super(command, false, true);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        if(inSameChannelAs(member)) {
            const guildAudio = audio.getGuildAudio(guild);
            guildAudio.stop();
            await interaction.deleteReply();
        } else {
            throw new CommandError('Must be in same channel');
        }
    }
}

export default new StopCommand();
