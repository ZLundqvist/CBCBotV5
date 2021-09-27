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
    .setName('entry')
    .setDescription('Set or get your entrysound')
    .addStringOption((option) => {
        option
            .setName('sfx')
            .setDescription('New SFX to use')
            .setRequired(false);
        return option;
    });


class UserEntrySoundCommand extends GuildCommand {
    constructor() {
        super(command, false, false);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
        const newSFX = interaction.options.getString('sfx', false);

        if(newSFX) {
            await entrySound.setMemberEntrySFX(member, newSFX);
            await interaction.reply(`New bot entrysound set to: '${newSFX}'`);
        } else {
            const entrysound = await entrySound.getMemberEntrySFX(member);
            if(!entrysound) {
                throw new CommandError('No entrysound set');
            }

            await interaction.reply(`Entrysound: ${entrysound}`);
        }
    }
}

export default new UserEntrySoundCommand();
