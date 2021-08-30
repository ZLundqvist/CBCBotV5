import { Command } from "./command";

export class CommandGroup {
    readonly name: string;
    private commands: Command[] = [];

    constructor(name: string) {
        this.name = name;
    }

    addCommand(cmd: Command) {
        this.commands.push(cmd);
    }

    getCommands(): Command[] {
        return this.commands;
    }
}