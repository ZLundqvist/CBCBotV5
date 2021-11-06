import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { CommandError, GuildCommand } from "../../core";
import entrySound from '../../modules/entry-sound';

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
        super(command.toJSON(), false, false);
    }

    async executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
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
