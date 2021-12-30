import Discord from 'discord.js';
import { getLoggerWrapper, LoggerWrapper } from '../utils/logger';

export abstract class Module {
    readonly name: string;
    protected readonly log: LoggerWrapper;

    constructor(name: string) {
        this.name = name;
        this.log = getLoggerWrapper(this.name);
    }

    abstract init(client: Discord.Client<true>): Promise<void>;
    abstract destroy(): Promise<void>
}
