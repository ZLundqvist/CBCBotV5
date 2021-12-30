import { BotCore, Precondition, PreconditionError } from '../core';
import { RunCommandContext } from '../core/command';

export default class OwnerOnlyPrecondition extends Precondition {
    async run(context: RunCommandContext): Promise<void> {
        if(!BotCore.config.isOwner(context.interaction.user)) {
            throw new PreconditionError('You do not have permission to do this, my dude');
        }
    }
}
