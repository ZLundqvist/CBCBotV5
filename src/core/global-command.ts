import Discord from 'discord.js';
import { BaseCommand, BaseCommandData } from './base-command';

export abstract class GlobalCommand extends BaseCommand {
    constructor(data: BaseCommandData, ownerOnly: boolean, autoDefer: boolean) {
        super(data, ownerOnly, autoDefer);
    }

    async execute(interaction: Discord.CommandInteraction): Promise<void> {
        // No pre-processing needs to be done here (yet)
        await this.executeGlobalCommand(interaction);
    }

    protected abstract executeGlobalCommand(interaction: Discord.CommandInteraction): Promise<void>;
}
