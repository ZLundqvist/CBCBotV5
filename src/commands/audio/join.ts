import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandError, GuildCommand, RunGuildCommandContext } from "../../core";
import audio from '../../modules/audio';
import { connect, inSameChannelAs } from "../../utils/voice";

const command = new SlashCommandBuilder()
    .setName('join')
    .setDescription('Move bot to your channel');

export default class JoinCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: true
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext) {
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
