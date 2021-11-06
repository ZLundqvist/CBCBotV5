import Discord, { CommandInteraction } from 'discord.js';
import { BaseCommand } from './base-command';

export abstract class GuildCommand extends BaseCommand {
    constructor(data: Discord.ApplicationCommandDataResolvable, ownerOnly: boolean, autoDefer: boolean) {
        super(data, ownerOnly, autoDefer);
    }

    async execute(interaction: Discord.CommandInteraction): Promise<void> {
        if(!interaction.inCachedGuild()) {
            throw new Error('Unable to get guild');
        }

        const member = await interaction.guild.members.fetch(interaction.user);
        await this.executeGuildCommand(interaction, interaction.guild, member);
    }

    protected abstract executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void>;
}
