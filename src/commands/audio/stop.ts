import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandError, GuildCommand, RunGuildCommandContext } from "../../core";
import audio from '../../modules/audio';
import { inSameChannelAs } from "../../utils/voice";

const command = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playing audio');

export default class StopCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: true
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext) {
        if(inSameChannelAs(member)) {
            const guildAudio = audio.getGuildAudio(guild);
            guildAudio.stop();
            await interaction.deleteReply();
        } else {
            throw new CommandError('Must be in same channel');
        }
    }
}

