import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import { CBCBotCore } from '../core';
import { CommandError } from './custom-errors';

export type BaseCommandData = {
    name: string;
    toJSON: () => ReturnType<SlashCommandBuilder['toJSON']>
};

export abstract class BaseCommand {
    readonly data: BaseCommandData;
    readonly ownerOnly: boolean;
    readonly autoDefer: boolean;

    constructor(data: BaseCommandData, ownerOnly: boolean, autoDefer: boolean) {
        this.data = data;
        this.ownerOnly = ownerOnly;
        this.autoDefer = autoDefer;
    }

    get name(): string {
        return this.data.name;
    }

    toJSON() {
        return this.data.toJSON();
    }

    toApplicationCommandData(): Discord.ApplicationCommandData {
        const json = this.data.toJSON();

        return {
            name: json.name,
            description: json.description,
            defaultPermission: json.default_permission,
            type: 'CHAT_INPUT',
            options: json.options as any
        };
    }

    async onInteraction(interaction: Discord.CommandInteraction) {
        if(this.ownerOnly && !CBCBotCore.config.isOwner(interaction.user)) {
            throw new CommandError('You do not have permission to do this, fucking loser');
        }

        if(this.autoDefer) {
            await interaction.deferReply();
        }

        await this.execute(interaction);
    }

    abstract execute(interaction: Discord.CommandInteraction): Promise<void>;
}
