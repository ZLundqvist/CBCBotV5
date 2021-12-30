import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandError, GuildCommand, RunGuildCommandContext } from "../../core";
import entrySound from '../../modules/entry-sound';

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


export default class BotEntrySoundCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: false
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext): Promise<void> {
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
