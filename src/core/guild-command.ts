import Discord from 'discord.js';
import { Command, RunCommandContext } from './command';

export interface RunGuildCommandContext extends RunCommandContext {
    guild: Discord.Guild;
    member: Discord.GuildMember;
};

export abstract class GuildCommand extends Command {
    async run(context: RunCommandContext): Promise<void> {
        if(!context.interaction.inCachedGuild()) {
            throw new Error('Unable to get guild');
        }

        const member = await context.interaction.guild.members.fetch(context.interaction.user);

        const guildContext: RunGuildCommandContext = {
            ...context,
            guild: context.interaction.guild,
            member: member
        };
        await this.runGuildCommand(guildContext);
    }

    protected abstract runGuildCommand(context: RunGuildCommandContext): Promise<void>;
}
