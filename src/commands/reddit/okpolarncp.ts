import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { GlobalCommand } from "../../core";
import reddit from '../../modules/reddit';

const command = new SlashCommandBuilder()
    .setName('okpolarncp')
    .setDescription('rolfmao');

class OpPolarnCPCommand extends GlobalCommand {
    constructor() {
        super(command.toJSON(), false, true);
    }

    async executeGlobalCommand(interaction: CommandInteraction) {
        const post = await reddit.getRandom('okpolarncp');
        const attachment = new Discord.MessageAttachment(post.buffer);
        await interaction.editReply({
            content: post.title,
            files: [attachment]
        });
    }
}

export default new OpPolarnCPCommand();
