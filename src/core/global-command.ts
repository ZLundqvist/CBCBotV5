import { Command, RunCommandContext } from './command';

export abstract class GlobalCommand extends Command {
    async run(context: RunCommandContext): Promise<void> {
        // No pre-processing needs to be done here (yet)
        await this.runGlobalCommand(context);
    }

    protected abstract runGlobalCommand(context: RunCommandContext): Promise<void>;
}
