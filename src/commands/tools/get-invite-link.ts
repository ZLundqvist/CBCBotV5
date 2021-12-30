import { SlashCommandBuilder } from '@discordjs/builders';
import { Permissions } from 'discord.js';
import { GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';

const command = new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get a link to invite this bot to other servers');

export default class GetInvinteLinkCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: false
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        const inviteUrl = context.interaction.client.generateInvite({
            scopes: [
                'bot',
                'applications.commands'
            ],
            permissions: Permissions.ALL
        });

        await context.interaction.reply({
            content: inviteUrl,
            ephemeral: true
        });
    }
}

