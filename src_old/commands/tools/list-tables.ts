import Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import { Command } from "../../core/command";

const name = 'TableList';
const keywords = [ 'tablelist' ];
const description = '';

class TableList extends Command {
    constructor() {
        super(name, keywords, description, false, true);
    }

    async execute(msg: Discord.Message): Promise<void> {
        let results: string[] = [];

        const baseFolder = path.join(__dirname, '../../database/entity');

        let readdirSync = (folder: string) => {
            fs.readdirSync(folder).forEach(file => {
                const p = path.join(folder, file);
                if(fs.lstatSync(p).isDirectory()) {
                    readdirSync(p);
                } else if (path.extname(p) === '.ts' || path.extname(p) === '.js'){
                    results.push(p.replace(baseFolder + '/', ''));
                }
            });
        };

        readdirSync(baseFolder);

        const setCharUpperCase = (string: string, charIndex: number) => {
            let result: string;

            if(charIndex === 0) {
                // If first
                result = string.charAt(charIndex).toUpperCase()  + string.substr(1);
            } else if(charIndex === string.length - 1) {
                // If last
                result = string.substr(0, charIndex) + string.charAt(charIndex).toUpperCase();
            } else {
                // Else
                result = string.substr(0, charIndex) + string.charAt(charIndex).toUpperCase()  + string.substr(charIndex + 1);
            }

            return result;
        }

        // Format found files
        for (let i = 0; i < results.length; i++) {
            // Set first uppercase
            results[i] = setCharUpperCase(results[i], 0);

            // Loop through result, find all '/' and '-' and replace the character after it with a uppercase one
            for (let j = 0; j < results[i].length; j++) {
                if(results[i].charAt(j) === '/' || results[i].charAt(j) === '-') {
                    results[i] = setCharUpperCase(results[i], j + 1);
                }
            }

            // Remove extension
            results[i] = results[i].replace('.ts', '');
            results[i] = results[i].replace('.js', '');
        }

        await msg.channel.send(results.join('\n'), { code: true });
    }
}

export default new TableList();