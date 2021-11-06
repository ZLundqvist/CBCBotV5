import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import { BotCore } from '../core';
import { CommandError } from './custom-errors';

export abstract class BaseCommand {
    readonly commandData: Discord.ApplicationCommandDataResolvable;
    readonly ownerOnly: boolean;
    readonly autoDefer: boolean;

    constructor(commandData: Discord.ApplicationCommandDataResolvable, ownerOnly: boolean, autoDefer: boolean) {
        this.commandData = commandData;
        this.ownerOnly = ownerOnly;
        this.autoDefer = autoDefer;
    }

    get name(): string {
        return this.commandData.name;
    }

    async onInteraction(interaction: Discord.CommandInteraction) {
        if(this.ownerOnly && !BotCore.config.isOwner(interaction.user)) {
            throw new CommandError('You do not have permission to do this, my dude');
        }

        if(this.autoDefer) {
            await interaction.deferReply();
        }

        await this.execute(interaction);
    }

    abstract execute(interaction: Discord.CommandInteraction): Promise<void>;
}
