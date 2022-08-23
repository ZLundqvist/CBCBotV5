import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import { GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';
import reddit from '../../modules/reddit';

const command = new SlashCommandBuilder()
    .setName('okpolarncp')
    .setDescription('rolfmao');

export default class OpPolarnCPCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: true
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        const post = await reddit.getRandom('okpolarncp');
        const attachment = new Discord.AttachmentBuilder(post.buffer);
        await context.interaction.editReply({
            content: post.title,
            files: [attachment]
        });
    }
}

