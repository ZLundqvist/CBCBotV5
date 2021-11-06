import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { getConnection } from 'typeorm';
import { CommandError, GlobalCommand } from "../../core";

const command = new SlashCommandBuilder()
    .setName('sql')
    .setDescription('[ADMIN] Run a custom SQL query')
    .addStringOption((option) => {
        return option
            .setName('query')
            .setDescription('Query to run')
            .setRequired(true);
    });

class SQLCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), true, false);
    }

    async executeGlobalCommand(interaction: CommandInteraction) {
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
