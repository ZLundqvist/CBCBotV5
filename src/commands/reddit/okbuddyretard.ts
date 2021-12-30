import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import { GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';
import reddit from '../../modules/reddit';

const command = new SlashCommandBuilder()
    .setName('okbuddyretard')
    .setDescription('rolfmao');

export default class OkBuddyRetardCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: true
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        const post = await reddit.getRandom('okbuddyretard');
        const attachment = new Discord.MessageAttachment(post.buffer);
        await context.interaction.editReply({
            content: post.title,
            files: [attachment]
        });
    }
}
