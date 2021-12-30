import { Collection } from 'discord.js';
import path from 'path';
import { Precondition } from '.';
import { getFiles } from '../utils/file';
import { formatPreconditionName } from '../utils/formatting';
import { getLoggerWrapper } from '../utils/logger';
import { Command, RunCommandContext } from './command';
import { ImportError } from './custom-errors';

const PreconditionsPath = path.join(__dirname, '../preconditions/');

export class PreconditionHandler {
    private readonly log = getLoggerWrapper('core');
    private readonly preconditions: Collection<string, Precondition>;

    constructor() {
        this.preconditions = new Collection();
    }

    async init(): Promise<void> {
        await this.registerPreconditions();
    }

    async runPreconditions(command: Command, context: RunCommandContext): Promise<void> {
        for(const preconditionName of command.preconditions) {
            const precondition = this.preconditions.get(preconditionName);

            if(!precondition) {
                this.log.warn(`Precondition does not exist: ${preconditionName}`);
                continue;
            }

            await precondition.run(context);
        }
    }

    private async registerPreconditions(): Promise<void> {
        this.log.time('Precondition import');

        const filePaths = getFiles(PreconditionsPath);

        for(const filePath of filePaths) {
            try {
                await this.registerPrecondition(filePath);
            } catch(error) {
                if(error instanceof ImportError) {
                    this.log.error(`Error importing precondition from file '${filePath}' (${error.message})`);
                } else {
                    throw error;
                }
            }
        }

        this.log.timeEnd('Precondition import');
        this.log.info(`Imported ${this.preconditions.size} preconditions`);
    }

    private async registerPrecondition(path: string): Promise<void> {
        const defaultExport = (await import(path)).default;

        // Check that the import is a Precondition
        if(!this.isPrecondition(defaultExport)) {
            throw new ImportError('Default export is not a Precondition');
        }

        const name = formatPreconditionName(defaultExport.name);
        const instance = new defaultExport();

        if(this.preconditions.has(name)) {
            throw new ImportError(`Duplicate command name: ${name}`);
        }

        if(instance instanceof Precondition) {
            this.log.debug(`Importing Precondition: ${name}`);
        } else {
            throw new ImportError('Encountered unknown instance');
        }

        this.preconditions.set(name, instance);
    }

    private isPrecondition(object: any): object is new () => Precondition {
        return typeof object === 'function' && object.prototype instanceof Precondition;
    }
}
