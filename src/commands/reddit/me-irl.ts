import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import { GlobalCommand } from "../../core";
import { RunCommandContext } from '../../core/command';
import reddit from '../../modules/reddit';

const command = new SlashCommandBuilder()
    .setName('me_irl')
    .setDescription('rolfmao');

export default class MeIRLCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: true
        });
    }

    async runGlobalCommand(context: RunCommandContext) {
        const post = await reddit.getRandom('me_irl');
        const attachment = new Discord.AttachmentBuilder(post.buffer);
        await context.interaction.editReply({
            content: post.title,
            files: [attachment]
        });
    }
}
