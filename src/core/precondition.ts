import Discord from 'discord.js';

export abstract class Precondition {

    constructor() {}

    abstract run(interaction: Discord.CommandInteraction): void;
}

