import Discord from 'discord.js';
import { getLoggerWrapper, LoggerWrapper } from '../utils/logger';

export interface CommandOptions {
    autoDefer: boolean;
    preconditions?: string[];
};

export interface RunCommandContext {
    interaction: Discord.CommandInteraction;
};

export abstract class Command {
    readonly commandData: Discord.ApplicationCommandDataResolvable;
    protected readonly options: CommandOptions;
    protected readonly log: LoggerWrapper;

    constructor(commandData: Discord.ApplicationCommandDataResolvable, options: CommandOptions) {
        this.commandData = commandData;
        this.options = options;

        this.log = getLoggerWrapper(this.name);
    }

    get name(): string {
        return this.commandData.name;
    }

    get preconditions(): string[] {
        return this.options.preconditions || [];
    }

    /**
     * Entrypoint for commands once its CommandInteraction has been received
     * Handles permissions and setup of reply
     * @param interaction 
     */
    async onInteraction(context: RunCommandContext) {
        // if(this.options.ownerOnly && !BotCore.config.isOwner(interaction.user)) {
        //     throw new CommandError('You do not have permission to do this, my dude');
        // }

        if(this.options.autoDefer) {
            await context.interaction.deferReply();
        }

        await this.run(context);
    }

    /**
     * Executes after onInteraction
     * @param interaction 
     */
    protected abstract run(context: RunCommandContext): Promise<void>;
}
