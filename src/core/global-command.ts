import { Command, RunCommandContext } from './command';

export abstract class GlobalCommand extends Command {
    async runCommand(context: RunCommandContext): Promise<void> {
        // No pre-processing needs to be done here (yet)
        await this.runGlobalCommand(context);
    }

    protected abstract runGlobalCommand(context: RunCommandContext): Promise<void>;
}
