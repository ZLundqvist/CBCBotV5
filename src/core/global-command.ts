import Discord from 'discord.js';
import { BaseCommand, BaseCommandData } from './base-command';

export abstract class GlobalCommand extends BaseCommand {
    constructor(data: BaseCommandData, ownerOnly: boolean, autoDefer: boolean) {
        super(data, ownerOnly, autoDefer);
    }

    async onInteraction(interaction: Discord.CommandInteraction): Promise<void> {
        if(this.autoDefer) {
            await interaction.deferReply();
        }

        await this.execute(interaction);
    }

    protected abstract execute(interaction: Discord.CommandInteraction): Promise<void>;
}
