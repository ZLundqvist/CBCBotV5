import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import getLogger from '../utils/logger';
import { timeMeasurement } from '../utils/time';
import { Module } from './module';

const log = getLogger('core');
const MODULES_PATH = path.join(__dirname, '../modules/');

export class ModuleHandler {
    private modules: Module[];

    constructor() {
        this.modules = [];
    }

    async init(client: Discord.Client<true>): Promise<void> {
        await this.registerModules(client);
    }

    async destroy() {
        log.info('Destroying modules');
        for (const module of this.modules) {
            await module.destroy();
        }
    }

    private async registerModules(client: Discord.Client<true>): Promise<void> {
        timeMeasurement.start('Module import');

        const moduleFolders = fs.readdirSync(MODULES_PATH).filter(file => {
            const name = path.join(MODULES_PATH, file);
            return fs.lstatSync(name).isDirectory()
        });

        for(const folder of moduleFolders) {
            const module = (await import(path.join(MODULES_PATH, folder))).default;

            if(module instanceof Module) {
                log.info(`Importing module: ${module.name}`);
                this.modules.push(module);
            } else {
                log.warn(`${folder} not instance of Module. Client injection will not occur.`);
            }
        }

        for(const module of this.modules) {
            await module.init(client);
        }

        timeMeasurement.end('Module import', log);
        log.info(`Imported ${this.modules.length} modules`);
    }
}
