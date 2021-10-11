import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { GuildCommand } from "../../core";
import audio from '../../modules/audio';

const command = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set or get the volume')
    .addIntegerOption((input) => {
        return input
            .setName('v')
            .setDescription('New volume')
            .setRequired(false);
    });

class VolumeCommand extends GuildCommand {
    constructor() {
        super(command, false, false);
    }

    async executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        const newVolume = interaction.options.getInteger('v', false);
        const guildAudio = audio.getGuildAudio(guild);

        if(newVolume) {
            guildAudio.setVolume(newVolume);

            if(newVolume === 100) {
                await interaction.reply('Volume set to: :100:%');
            } else {
                await interaction.reply(`Volume set to: ${newVolume}%`);
            }
        } else {
            const currentVolume = await guildAudio.getVolume();
            if(currentVolume === 100) {
                await interaction.reply('Current volume: :100:%');
            } else {
                await interaction.reply(`Current volume: ${currentVolume}%`);
            }
        }
    }
}

export default new VolumeCommand();
