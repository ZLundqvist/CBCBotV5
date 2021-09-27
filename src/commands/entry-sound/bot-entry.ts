import { CommandError, GuildCommand } from "@core";
import { DBGuildUtils } from '@db/guild';
import { SlashCommandBuilder } from '@discordjs/builders';
import audio from '@modules/audio';
import entrySound from '@modules/entry-sound';
import getLogger from '@utils/logger';
import { connectIfAloneOrDisconnected, inSameChannelAs, inVoiceChannel } from "@utils/voice";
import ResourceHandler from 'core/resource-handler';
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('botentry')
    .setDescription('Set or get the current botentry sfx')
    .addStringOption((option) => {
        option
            .setName('sfx')
            .setDescription('New SFX to use')
            .setRequired(false);
        return option;
    });


class BotEntrySoundCommand extends GuildCommand {
    constructor() {
        super(command, false, false);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
        const newSFX = interaction.options.getString('sfx', false);

        if(newSFX) {
            await entrySound.setBotEntrySFX(guild, newSFX);
            await interaction.reply(`New bot entrysound set to: '${newSFX}'`);
        } else {
            const entrysound = await entrySound.getBotEntrySFX(guild);
            if(!entrysound) {
                throw new CommandError('No bot entrysound set');
            }
            await interaction.reply(`Bot entrysound: ${entrysound}`);
        }
    }
}

export default new BotEntrySoundCommand();
