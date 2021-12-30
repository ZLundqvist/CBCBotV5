import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { GuildCommand } from "../../core";
import audio from '../../modules/audio';
import { inSameChannelAs } from "../../utils/voice";

const command = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip current song');

export default class SkipCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            ownerOnly: false,
            autoDefer: true
        });
    }

    async executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        if(inSameChannelAs(member)) {
            const guildAudio = audio.getGuildAudio(guild);
            guildAudio.skipCurrent();
            await interaction.deleteReply();
        } else {
            await interaction.editReply('Must be in same channel');
        }
    }
}

