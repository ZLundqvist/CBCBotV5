import Discord from 'discord.js';

export abstract class Module {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    abstract init(client: Discord.Client<true>): Promise<void>;
}
