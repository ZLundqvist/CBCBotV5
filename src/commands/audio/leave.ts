import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { CommandError, GuildCommand } from "../../core";
import { disconnect, inSameChannelAs, isAlone } from "../../utils/voice";

const command = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Disconnect bot from channel');

class LeaveCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), false, true);
    }

    async executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        if(inSameChannelAs(member) || isAlone(guild)) {
            disconnect(guild);
            await interaction.deleteReply();
        } else {
            throw new CommandError('Unable to leave current channel');
        }
    }
}

export default new LeaveCommand();
