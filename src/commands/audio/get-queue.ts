import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildCommand, RunGuildCommandContext } from "../../core";
import audio from '../../modules/audio';

const command = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Get current queue');

export default class GetQueueCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: true
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext) {
        const embed = await audio.getGuildAudio(guild).getQueueEmbed();
        await interaction.editReply({ embeds: [embed] });
    }
}
