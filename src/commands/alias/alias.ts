import { codeBlock, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { BotCore, CommandError, GuildCommand, RunGuildCommandContext } from "../../core";
import alias from "../../modules/alias";

const listCommand = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('List aliases');

const removeCommand = new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Remove an alias')
    .addStringOption((option) => {
        option
            .setName('key')
            .setDescription('Key of alias to remove')
            .setRequired(true)
        return option;
    });

const addCommand = new SlashCommandSubcommandBuilder()
    .setName('add')
    .setDescription('Add an alias')
    .addStringOption((option) => {
        option
            .setName('key')
            .setDescription('Key of alias to add')
            .setRequired(true)
        return option;
    })
    .addStringOption((option) => {
        option
            .setName('value')
            .setDescription('Value of alias to add')
            .setRequired(true)
        return option;
    })

const command = new SlashCommandBuilder()
    .setName('alias')
    .setDescription('Manage guild aliases')
    .addSubcommand(removeCommand)
    .addSubcommand(addCommand)
    .addSubcommand(listCommand);

export default class AliasCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: false
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext) {
        const subcommand = interaction.options.getSubcommand();

        switch(subcommand) {
            case 'add':
                await this.add(interaction, guild);
                break;
            case 'remove':
                await this.remove(interaction, guild);
                break;
            case 'list':
                await this.list(interaction, guild);
                break;
        }
    }

    private async add(interaction: CommandInteraction, guild: Discord.Guild) {
        const key = interaction.options.getString('key', true);
        const value = interaction.options.getString('value', true);

        const created = await alias.addInGuild(guild, key, value);
        await interaction.reply(`Alias ${created.key} added with value ${created.value}`);
    }

    private async remove(interaction: CommandInteraction, guild: Discord.Guild) {
        const key = interaction.options.getString('key', true);
        await alias.removeInGuild(guild, key);
        await interaction.reply(`Alias ${key} removed`);
    }

    private async list(interaction: CommandInteraction, guild: Discord.Guild) {
        const aliases = await BotCore.database.getGuildAliases(guild);

        if(aliases.length === 0) {
            throw new CommandError('Add an alias first');
        }

        let list: string[] = [];
        for(let alias of aliases) {
            list.push(`${alias.key} -> ${alias.value}`);
        }

        await interaction.reply(`Aliases in guild ${interaction.guild?.name}${codeBlock(list.join('\n'))}`);
    }
}
