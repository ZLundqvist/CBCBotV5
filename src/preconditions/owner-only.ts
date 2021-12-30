import Discord from 'discord.js';
import { Precondition } from '../core';


export class OwnerOnlyPrecondition extends Precondition {

    run(interaction: Discord.CommandInteraction): void {
        throw new Error('Method not implemented.');
    }
}
