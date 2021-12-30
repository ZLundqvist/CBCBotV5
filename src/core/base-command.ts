import Discord from 'discord.js';
import { BotCore } from '../core';
import { getLoggerWrapper, LoggerWrapper } from '../utils/logger';
import { CommandError } from './custom-errors';

export type BaseCommandParams = {
    ownerOnly: boolean;
    autoDefer: boolean;
    preconditions?: string[];
};

export abstract class BaseCommand {
    readonly commandData: Discord.ApplicationCommandDataResolvable;
    protected readonly params: BaseCommandParams;
    protected readonly log: LoggerWrapper;

    constructor(commandData: Discord.ApplicationCommandDataResolvable, params: BaseCommandParams) {
        this.commandData = commandData;
        this.params = params;

        this.log = getLoggerWrapper(this.name);
    }

    get name(): string {
        return this.commandData.name;
    }

    /**
     * Entrypoint for commands once its CommandInteraction has been received
     * Handles permissions and setup of reply
     * @param interaction 
     */
    async onInteraction(interaction: Discord.CommandInteraction) {
        if(this.params.ownerOnly && !BotCore.config.isOwner(interaction.user)) {
            throw new CommandError('You do not have permission to do this, my dude');
        }

        if(this.params.autoDefer) {
            await interaction.deferReply();
        }

        await this.execute(interaction);
    }

    /**
     * Executes after onInteraction
     * @param interaction 
     */
    protected abstract execute(interaction: Discord.CommandInteraction): Promise<void>;
}
