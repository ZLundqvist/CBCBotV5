import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { CommandError, GuildCommand } from "../../core";
import audio from '../../modules/audio';
import { inSameChannelAs } from "../../utils/voice";

const command = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playing audio');

export default class StopCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            ownerOnly: false,
            autoDefer: true
        });
    }

    async executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        if(inSameChannelAs(member)) {
            const guildAudio = audio.getGuildAudio(guild);
            guildAudio.stop();
            await interaction.deleteReply();
        } else {
            throw new CommandError('Must be in same channel');
        }
    }
}

