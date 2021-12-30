import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandError, GuildCommand, RunGuildCommandContext } from "../../core";
import { disconnect, inSameChannelAs, isAlone } from "../../utils/voice";

const command = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Disconnect bot from channel');

export default class LeaveCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            ownerOnly: false,
            autoDefer: true
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext) {
        if(inSameChannelAs(member) || isAlone(guild)) {
            disconnect(guild);
            await interaction.deleteReply();
        } else {
            throw new CommandError('Unable to leave current channel');
        }
    }
}
