import { CommandError, GuildCommand } from "@core";
import { SlashCommandBuilder } from '@discordjs/builders';
import getLogger from '@utils/logger';
import { disconnect, inSameChannelAs, isAlone } from "@utils/voice";
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Disconnect bot from channel');

class LeaveCommand extends GuildCommand {
    constructor() {
        super(command, false, true);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember) {
        if(inSameChannelAs(member) || isAlone(guild)) {
            await disconnect(guild);
            await interaction.deleteReply();
        } else {
            throw new CommandError('Unable to leave current channel');
        }
    }
}

export default new LeaveCommand();
