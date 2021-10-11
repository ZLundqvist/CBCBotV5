import { CommandError, GuildCommand } from "@core";
import { SlashCommandBuilder } from '@discordjs/builders';
import audio from '@modules/audio';
import getLogger from '@utils/logger';
import { connect, inSameChannelAs } from "@utils/voice";
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('join')
    .setDescription('Move bot to your channel');

class JoinCommand extends GuildCommand {
    constructor() {
        super(command, false, true);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        if(inSameChannelAs(member)) {
            throw new CommandError('Already in your channel');
        }

        if(!member.voice.channel) {
            throw new CommandError('You must be in a channel first');
        }

        const guildAudio = audio.getGuildAudio(guild);
        if(guildAudio.isPlaying) {
            throw new CommandError('Unable to join your channel (currently playing audio)');
        }

        await connect(member.voice.channel);
        await interaction.deleteReply();
    }
}

export default new JoinCommand();
