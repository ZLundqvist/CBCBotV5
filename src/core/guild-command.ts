import { CommandError } from '@core';
import Discord, { CommandInteraction } from 'discord.js';
import { BaseCommand, BaseCommandData } from './base-command';

export abstract class GuildCommand extends BaseCommand {
    constructor(data: BaseCommandData, ownerOnly: boolean, autoDefer: boolean) {
        super(data, ownerOnly, autoDefer);
    }

    async onInteraction(interaction: Discord.CommandInteraction): Promise<void> {
        if(!interaction.inGuild()) {
            throw new CommandError('This is a guild-only command');
        }

        const guild = await interaction.client.guilds.fetch(interaction.guildId);
        const member = await guild.members.fetch(interaction.user);

        if(!guild) {
            throw new Error('unable to resolve guild');
        }

        if(!member) {
            throw new Error('unable to resolve member');
        }

        if(this.autoDefer) {
            await interaction.deferReply();
        }

        await this.execute(interaction, guild, member);
    }

    protected abstract execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void>;
}
