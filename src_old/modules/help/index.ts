import Discord from 'discord.js';
import { getCommands } from "../../core";
import { CommandError } from "../../core/command-error";
import { Module } from "../../core/module";

class Help extends Module {

    constructor() {
        super('Help');
    }

    async init(client: Discord.Client): Promise<void> {}
    
    getGroupsEmbed(): string {
        const commands = getCommands();
        
        let results = 'Command groups:\n';
        for(let commandGroup of commands.getCommandGroups().sort((a, b) => a.name > b.name ? 1 : -1)) {
            results += `\t${commandGroup.name}\n`;
        }
        results += "Use 'help <group>' for commands";

        return results;
    }

    getGroupEmbed(groupName: string): string {
        const commands = getCommands();
        const group = commands.getCommandGroups().find(cmdGroup => cmdGroup.name === groupName);

        if(!group) {
            throw new CommandError(`No CommandGroup: ${groupName}`);
        }

        let results = `Commands for ${group.name}\n`;
        for(let command of group.getCommands().sort((a, b) => a.name > b.name ? 1 : -1)) {
            results += `${command.keywords.join(', ')} - ${command.description}`;
            results += command.isGuildOnly ? ' (Guild only)' : '';
            results += command.isAdminOnly ? ' (Admin only)' : '';
            results += '\n';
        }

        return results;
    }
}

export default new Help();