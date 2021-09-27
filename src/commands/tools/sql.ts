import { CommandError, GlobalCommand } from "@core";
import { SlashCommandBuilder } from '@discordjs/builders';
import getLogger from '@utils/logger';
import Discord, { CommandInteraction } from 'discord.js';
import { getConnection } from 'typeorm';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('sql')
    .setDescription('Run a custom SQL query')
    .addStringOption((option) => {
        option
            .setName('query')
            .setDescription('Query to run')
            .setRequired(true)
        return option;
    });

class SQLCommand extends GlobalCommand {
    constructor() {
        super(command, true, false);
    }

    async execute(interaction: CommandInteraction) {
        const query = interaction.options.getString('query', true);

        try {
            const queryResults = await getConnection().query(query);
            const resultsString = JSON.stringify(queryResults, null, 2);
            const buffer = Buffer.from(resultsString);
            const attachment = new Discord.MessageAttachment(buffer, 'results.txt');

            await interaction.reply({
                files: [
                    attachment
                ]
            });
        } catch(e: any) {
            throw new CommandError(e.message);
        }
    }
}

export default new SQLCommand();