import getLogger from '@utils/logger';
import { measure } from '@utils/time';
import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Module } from './module';

const log = getLogger('Core');
const MODULES_PATH = path.join(__dirname, '../modules/');

export class Modules {
    private modules: Module[];

    constructor() {
        this.modules = [];
    }

    async init(client: Discord.Client<true>) {
        await this.registerModules(client);
    }

    private async registerModules(client: Discord.Client<true>) {
        measure.start('Module import');

        const moduleFolders = fs.readdirSync(MODULES_PATH).filter(file => {
            const name = path.join(MODULES_PATH, file);
            return fs.lstatSync(name).isDirectory()
        });

        for(const folder of moduleFolders) {
            const module = (await import(path.join(MODULES_PATH, folder))).default;

            if(module instanceof Module) {
                log.info(`Importing module: ${module.name}`);
                await module.init(client);
                this.modules.push(module);
            } else {
                log.warn(`${folder} not instance of Module. Client injection will not occur.`);
            }
        }

        measure.end('Module import', log);
        log.info(`Imported ${this.modules.length} modules`);
    }
}
