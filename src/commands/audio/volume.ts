import { GuildCommand } from "@core";
import { SlashCommandBuilder } from '@discordjs/builders';
import audio from '@modules/audio';
import getLogger from '@utils/logger';
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

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

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
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
