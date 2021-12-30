import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { getConnection } from 'typeorm';
import { CommandError, GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';

const command = new SlashCommandBuilder()
    .setName('sql')
    .setDescription('[ADMIN] Run a custom SQL query')
    .addStringOption((option) => {
        return option
            .setName('query')
            .setDescription('Query to run')
            .setRequired(true);
    });

export default class SQLCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            ownerOnly: true,
            autoDefer: false
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        const query = context.interaction.options.getString('query', true);

        try {
            const queryResults = await getConnection().query(query);
            const resultsString = JSON.stringify(queryResults, null, 2);
            const buffer = Buffer.from(resultsString);
            const attachment = new Discord.MessageAttachment(buffer, 'results.txt');

            await context.interaction.reply({
                files: [
                    attachment
                ]
            });
        } catch(e: any) {
            throw new CommandError(e.message);
        }
    }
}
