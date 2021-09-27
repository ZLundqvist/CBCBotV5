import { GlobalCommand } from "@core";
import { SlashCommandBuilder } from '@discordjs/builders';
import getLogger from '@utils/logger';
import { CommandInteraction, Permissions } from 'discord.js';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get a link to invite this bot to other servers');

class GetInvinteLinkCommand extends GlobalCommand {
    constructor() {
        super(command, false, false);
    }

    async execute(interaction: CommandInteraction) {
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
