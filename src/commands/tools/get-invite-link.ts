import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Permissions } from 'discord.js';
import { GlobalCommand } from "../../core";

const command = new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get a link to invite this bot to other servers');

class GetInvinteLinkCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), false, false);
    }

    async executeGlobalCommand(interaction: CommandInteraction) {
        const inviteUrl = interaction.client.generateInvite({
            scopes: [
                'bot',
                'applications.commands'
            ],
            permissions: Permissions.ALL
        });

        await interaction.reply({
            content: inviteUrl,
            ephemeral: true
        });
    }
}

export default new GetInvinteLinkCommand();
