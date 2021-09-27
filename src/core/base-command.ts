import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';

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

    get name() {
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

    abstract onInteraction(interaction: Discord.CommandInteraction): Promise<void>;
}
