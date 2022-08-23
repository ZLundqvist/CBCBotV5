import { SlashCommandBuilder } from '@discordjs/builders';
import { OAuth2Scopes, Partials, PermissionFlagsBits, Permissions } from 'discord.js';
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
                OAuth2Scopes.Bot,
                OAuth2Scopes.ApplicationsCommands
            ],
            permissions: [
                PermissionFlagsBits.Administrator
            ]
        });

        await context.interaction.reply({
            content: inviteUrl,
            ephemeral: true
        });
    }
}

