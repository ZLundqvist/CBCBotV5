import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandError, GuildCommand, RunGuildCommandContext } from "../../core";
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


export default class UserEntrySoundCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: false
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext): Promise<void> {
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
