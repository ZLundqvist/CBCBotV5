import { CommandError } from '../core';
import Discord, { CommandInteraction } from 'discord.js';
import { BaseCommand, BaseCommandData } from './base-command';

export abstract class GuildCommand extends BaseCommand {
    constructor(data: BaseCommandData, ownerOnly: boolean, autoDefer: boolean) {
        super(data, ownerOnly, autoDefer);
    }

    async execute(interaction: Discord.CommandInteraction): Promise<void> {
        if(!interaction.inGuild()) {
            throw new CommandError('This is a guild-only command');
        }

        const guild = await interaction.client.guilds.fetch(interaction.guildId);

        if(!guild) {
            throw new Error('unable to resolve guild');
        }

        const member = await guild.members.fetch(interaction.user);

        if(!member) {
            throw new Error('unable to resolve member');
        }

        await this.executeGuildCommand(interaction, guild, member);
    }

    protected abstract executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void>;
}
