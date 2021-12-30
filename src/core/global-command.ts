import Discord from 'discord.js';
import { BaseCommand } from './base-command';

export abstract class GlobalCommand extends BaseCommand {
    async execute(interaction: Discord.CommandInteraction): Promise<void> {
        // No pre-processing needs to be done here (yet)
        await this.executeGlobalCommand(interaction);
    }

    protected abstract executeGlobalCommand(interaction: Discord.CommandInteraction): Promise<void>;
}
