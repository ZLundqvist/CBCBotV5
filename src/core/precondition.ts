import { RunCommandContext } from './command';

export abstract class Precondition {
    abstract run(context: RunCommandContext): Promise<void>;
}

