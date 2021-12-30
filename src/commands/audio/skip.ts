import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildCommand, RunGuildCommandContext } from "../../core";
import audio from '../../modules/audio';
import { inSameChannelAs } from "../../utils/voice";

const command = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip current song');

export default class SkipCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: true
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext) {
        if(inSameChannelAs(member)) {
            const guildAudio = audio.getGuildAudio(guild);
            guildAudio.skipCurrent();
            await interaction.deleteReply();
        } else {
            await interaction.editReply('Must be in same channel');
        }
    }
}

