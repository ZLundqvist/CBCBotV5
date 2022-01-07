import Discord from 'discord.js';
import { Precondition } from '.';
import { getLoggerWrapper, LoggerWrapper } from '../utils/logger';

export interface CommandOptions {
    autoDefer: boolean;
    preconditions?: Precondition[];
};

export interface RunCommandContext {
    client: Discord.Client<true>;
    interaction: Discord.CommandInteraction;
};

export abstract class Command {
    readonly commandData: Discord.ApplicationCommandDataResolvable;
    protected readonly options: Required<CommandOptions>;
    protected readonly log: LoggerWrapper;

    constructor(commandData: Discord.ApplicationCommandDataResolvable, options: CommandOptions) {
        this.commandData = commandData;
        // Assign default values to optional properties
        this.options = Object.assign({
            preconditions: []
        }, options);
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
    async run(interaction: Discord.CommandInteraction): Promise<void> {
        const context: RunCommandContext = {
            client: interaction.client,
            interaction: interaction
        };

        await this.runPreconditions(context);

        if(this.options.autoDefer) {
            await context.interaction.deferReply();
        }

        await this.runCommand(context);
    }

    private async runPreconditions(context: RunCommandContext): Promise<void> {
        for (const precondition of this.options.preconditions) {
            await precondition.run(context);
        }
    }

    /**
     * Executes after run
     * @param interaction 
     */
    protected abstract runCommand(context: RunCommandContext): Promise<void>;
}
