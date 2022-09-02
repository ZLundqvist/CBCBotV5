import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import { BotCore, CommandError, GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';
import { OwnerOnlyPrecondition } from '../../preconditions';

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
            autoDefer: false,
            preconditions: [
                new OwnerOnlyPrecondition()
            ]
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        const query = context.interaction.options.getString('query', true);

        try {
            const queryResults = await BotCore.database.query(query);
            const resultsString = JSON.stringify(queryResults, null, 2);
            const buffer = Buffer.from(resultsString);
            const attachment = new Discord.AttachmentBuilder(buffer).setName('results.txt');

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
