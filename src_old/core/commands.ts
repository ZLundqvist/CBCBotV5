import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import emojiCharacters from '../constants/emoji-character';
import { getGuildPrefix } from "../database/entity/guild";
import { hasPrefix } from "../utils/bot-utils";
import config from "../utils/config";
import getLogger from '../utils/logger';
import { messageHasKeyword } from "../utils/message";
import { longest } from "../utils/utils";
import { Command } from "./command";
import { CommandError } from './command-error';
import { CommandGroup } from "./command-group";
const log = getLogger(__dirname);

const commandsPath = path.join(__dirname, '../commands/');

export class Commands {
    private groups: CommandGroup[];

    constructor() {
        this.groups = [];
    }

    async init(client: Discord.Client) {
        await this.registerCommands();

        client.on('message', (msg: Discord.Message) => {
            this.processMessage(msg);
        });
    }

    private async registerCommands() {
        log.info('Importing commands');
    
        // A folder is a group
        const folders = fs.readdirSync(commandsPath).filter(file => {
            const name = path.join(commandsPath, file);
            return fs.lstatSync(name).isDirectory()
        });

        for(const folder of folders) {
            log.info(`Importing command group: ${folder}`);
            const group = new CommandGroup(folder);

            const files = fs.readdirSync(path.join(commandsPath, folder));
            for(const file of files) {
                if(file.endsWith('.ts') || file.endsWith('.js')) {
                    const cmd = (await import(path.join(commandsPath, folder, file))).default;
    
                    if(cmd instanceof Command) {
                        group.addCommand(cmd);
                    }
                }
            }
    
            this.groups.push(group);
        }

        this.checkDuplicateKeywords();
        log.info(`Imported ${this.groups.length} groups and ${this.getAllCommands().length} commands total`)
    }

    /**
     * Checks and warns if two commands shares the same keyword
     */
    private checkDuplicateKeywords() {
        const conflicts: Map<string, Command[]> = new Map();

        // Map keyword to their command(s)
        for(const command of this.getAllCommands()) {
            for(const keyword of command.keywords) {
                if(!conflicts.has(keyword))
                    conflicts.set(keyword, []);

                const cmds = conflicts.get(keyword)!;
                cmds.push(command);
            }
        }

        // Check if a keyword is mapped to more than 1 command
        for(let keyword of conflicts.keys()) {
            let commands = conflicts.get(keyword)!;

            if(commands.length > 1) {
                const names = commands.map(cmd => cmd.name);
                log.warn(`Found conflicting keywords for commands: ${names.join(', ')} - ${keyword}`);
            }
        }
    }

    /**
     * The entrypoint for commands through messages
     * @param msg 
     */
    private async processMessage(msg: Discord.Message) {
        if(!await hasPrefix(msg)) {
            return;
        }
    
        // If bot sent message
        if(msg.author.id === msg.client.user?.id || msg.author.bot) {
            return;
        }
    
        // Replace any amount of spaces with a single space
        // TODO: is this needed?
        msg.content = msg.content.replace(/  +/g, ' ');
    
        const prefix = msg.guild ? await getGuildPrefix(msg.guild) : config.getConfigValue('default-prefix');
        const cmd = this.getCmdFromMessage(msg.content.substr(prefix.length));
        if(!cmd) {
            return;
        }

        if(cmd.isGuildOnly && !msg.guild) {
            await msg.reply(`${emojiCharacters.deny} This is a guild-only command`);
            return;
        }
    
        if(await cmd.canUserExecute(msg.author, msg.guild)) {
            try {
                await cmd.execute(msg, ...cmd.extractArguments(msg.content.substr(prefix.length)));
            } catch(error) {
                if(error instanceof CommandError) {
                    await msg.channel.send(`${emojiCharacters.deny} **${error.message}**`);
                } else {
                    await msg.channel.send(`${emojiCharacters.deny} Error: **${error.message}**`);
                    log.error(error);
                }
            }
        } else {
            await msg.reply(`${emojiCharacters.deny} You do not have permission for this.`);
        }
    }

    getCommandGroups(): CommandGroup[] {
        return this.groups;
    }

    private getAllCommands(): Command[] {
        return this.groups.reduce((acc, cur) => acc.concat(cur.getCommands()), [] as Command[]);
    }

    /**
     * Big complicated method which finds the correct command given a message
     * It gets all keywords which would trigger on the message, and then returns the command which has the longest one (in terms of characters)
     * @param message 
     */
    private getCmdFromMessage(message: string): Command | null {
        log.trace('getCmdFromMessage::' + message);

        interface MatchingCommand {
            cmd: Command;
            keyword: string;
        }

        let matchingCommands: MatchingCommand[] = [];

        for(let command of this.getAllCommands()) {
            const matchingKeywords = command.keywords.filter(keyword => messageHasKeyword(message, keyword));

            if(matchingKeywords.length === 0) {
                // If no keywords matched matched with command, move to next command
                continue;
            } else if(matchingKeywords.length === 1) {
                // If one keyword matched in the command, add it to list of matches
                let match : MatchingCommand = {
                    cmd: command,
                    keyword: matchingKeywords[0]
                };

                matchingCommands.push(match);
            } else if(matchingKeywords.length > 1) {
                // If more than 1 keyword was matched for the same command, add the longest keyword to match
                let match: MatchingCommand = {
                    cmd: command,
                    keyword: longest(matchingKeywords)
                };

                matchingCommands.push(match);
            }
        }


        if(matchingCommands.length === 1) {
            // If only 1 command matched, return it
            return matchingCommands[0].cmd;
        } else if(matchingCommands.length > 1) {
            // If at least 2 commands were found, return the one with the longest matching keyword
            const sortedMatches: MatchingCommand[] = matchingCommands.sort((a, b) => {
                return b.keyword.length - a.keyword.length;
            });
            return sortedMatches[0].cmd;
        } else {
            return null;
        }
    }
}
