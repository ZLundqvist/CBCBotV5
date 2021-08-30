import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import getLogger from '../utils/logger';
import { Module } from "./module";

const log = getLogger(__dirname);
const modulesPath = path.join(__dirname, '../modules/');

export class Modules {

    private modules: Module[];

    constructor() {
        this.modules = [];
    }

    async init(client: Discord.Client) {
        await this.registerCommands(client);
    }

    private async registerCommands(client: Discord.Client) {
        log.info('Importing modules');
    
        // A folder is a family
        const folders = fs.readdirSync(modulesPath).filter(file => {
            const name = path.join(modulesPath, file);
            return fs.lstatSync(name).isDirectory()
        });
    
        for(const folder of folders) {
            const module = (await import(path.join(modulesPath, folder))).default;

            if(module instanceof Module) {
                log.info(`Importing module: ${module.name}`);
                await module.init(client);
                this.modules.push(module);
            } else {
                log.warn(`${folder} not instanceof Module. Client injection will not occurr.`);
            }
        }
    
        log.info(`Imported ${this.modules.length} modules`)
    }
}