import Discord from 'discord.js';
import { isAdminInGuild } from '../database/entity/administrator';
import { isOwner } from '../utils/bot-utils';
import { messageHasKeyword } from '../utils/message';

export abstract class Command {
    name: string;
    keywords: string[];
    description: string;
    isGuildOnly: boolean;
    isAdminOnly: boolean;
    
    /**
     * @param name name of command
     * @param keywords keywords that trigger command
     * @param description description of command
     * @param isGuildOnly is guild only?
     * @param isAdminOnly is admin only?
     */
    constructor(name: string, keywords: string[], description: string, isGuildOnly: boolean, isAdminOnly: boolean) {
        this.name = name;
        this.keywords = keywords.sort((a, b) => a > b ? 1 : -1);
        this.description = description;
        this.isGuildOnly = isGuildOnly;
        this.isAdminOnly = isAdminOnly;
    }

    /**
     * Callback that runs when command is triggered by message
     * @param msg Message that triggered command
     */
    abstract execute(msg: Discord.Message, ...args: string[]): Promise<void>;

    /**
     * Checks if a user has the priviliges to run this command
     * @param user 
     * @param guild 
     */
    async canUserExecute(user: Discord.User, guild: Discord.Guild | null): Promise<boolean> {
        // If not admin command, everyone can run no matter if it's a guild message or not
        if(!this.isAdminOnly) {
            return true;
        }

        if(isOwner(user)) {
            return true;
        }
            
        if(guild) {
            return await isAdminInGuild(user, guild);
        }

        return false;
    }

    /**
     * Extracts all arguments from a message
     * @param message String to extract args from
     */
    extractArguments(message: string): string[] {
        const args: string[] = [];

        // Find which keyword matches message
        for(let keyword of this.keywords) {
            if(!messageHasKeyword(message, keyword))
                continue;

            // If message is ONLY the keyword
            if(message.length === keyword.length)
                continue;

            // Take (command - keyword + 1 space) and split it on spaces to get args
            args.push(...message.substr(keyword.length + 1).split(' '));
        }

        return args;
    }
};