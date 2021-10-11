import { codeBlock, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CommandError, GuildCommand } from "../../core";
import alias from "../../modules/alias";
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

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

class AliasCommand extends GuildCommand {
    constructor() {
        super(command, false, false);
    }

    async execute(interaction: CommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch(subcommand) {
            case 'add':
                await this.add(interaction);
                break;
            case 'remove':
                await this.remove(interaction);
                break;
            case 'list':
                await this.list(interaction);
                break;
        }
    }

    private async add(interaction: CommandInteraction) {
        const guildId = interaction.guildId;
        if(!guildId) {
            log.warn('No guild present in alias add cmd');
            return;
        }

        const key = interaction.options.getString('key', true);
        const value = interaction.options.getString('value', true);

        const created = await alias.addInGuild(guildId, key, value);
        await interaction.reply(`Alias ${created.key} added with value ${created.value}`);
    }

    private async remove(interaction: CommandInteraction) {
        const guildId = interaction.guildId;
        if(!guildId) {
            log.warn('No guild present in alias add cmd');
            return;
        }

        const key = interaction.options.getString('key', true);
        await alias.removeInGuild(guildId, key);
        await interaction.reply(`Alias ${key} removed`);
    }

    private async list(interaction: CommandInteraction) {
        const guildId = interaction.guildId;
        if(!guildId) {
            log.warn('No guild present in alias add cmd');
            return;
        }

        const aliases = await alias.getAllInGuild(guildId);

        if(aliases.length === 0) {
            throw new CommandError('Add an alias first retard.');
        }

        let list: string[] = [];
        for(let alias of aliases) {
            list.push(`${alias.key} -> ${alias.value}`);
        }

        await interaction.reply(`Aliases in guild ${interaction.guild?.name}${codeBlock(list.join('\n'))}`);
    }
}

export default new AliasCommand();
