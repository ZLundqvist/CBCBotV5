import assert from 'assert';
import Discord from 'discord.js';
import path from 'path';
import { ImportError } from '.';
import { getDirectories } from '../utils/file';
import { getLoggerWrapper } from '../utils/logger';
import { Module } from './module';

const log = getLoggerWrapper('core');
const MODULES_PATH = path.join(__dirname, '../modules/');

export class ModuleHandler {
    private readonly modules: Discord.Collection<string, Module>;
    private readonly client: Discord.Client;

    constructor(client: Discord.Client) {
        this.modules = new Discord.Collection();
        this.client = client;
    }

    async init(): Promise<void> {
        assert(this.client.isReady());
        await this.registerModules();
    }

    async destroy() {
        log.info('Destroying modules');
        for(const module of this.modules.values()) {
            await module.destroy();
        }
    }

    private async registerModules(): Promise<void> {
        log.time('Module import');

        const modulePaths = getDirectories(MODULES_PATH);

        for(const modulePath of modulePaths) {
            try {
                await this.registerModule(modulePath);
            } catch(error) {
                if(error instanceof ImportError) {
                    log.error(`Error importing module from file '${modulePath}' (${error.message})`);
                } else {
                    throw error;
                }
            }
        }

        for(const module of this.modules.values()) {
            await module.init(this.client);
        }

        log.timeEnd('Module import');
        log.info(`Imported ${this.modules.size} modules`);
    }

    private async registerModule(path: string): Promise<void> {
        const defaultExport = (await import(path)).default;

        if(!(defaultExport instanceof Module)) {
            throw new ImportError(`Default export is not instanceof Module`);
        }

        if(this.modules.has(defaultExport.name)) {
            throw new ImportError(`Duplicate module name: ${defaultExport.name}`);
        }

        log.debug(`Importing module: ${defaultExport.name}`);
        this.modules.set(defaultExport.name, defaultExport);
    }
}
