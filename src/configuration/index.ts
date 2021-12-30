import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import { getLoggerWrapper } from '../utils/logger';

class ConfigurationParameters {
    'token': string = '';
    'owner-id': string = '';
    'youtube-api-key': string = '';
    'reddit-client-id': string = '';
    'reddit-client-secret': string = '';
    'reddit-refresh-token': string = '';
}

export class Configuration {
    private readonly log = getLoggerWrapper('config');

    private configPath: string;
    private parameters: ConfigurationParameters;

    constructor(configPath: string) {
        this.configPath = path.resolve(configPath);
        this.parameters = new ConfigurationParameters();
    }

    /**
     * Loads and validates the config file
     */
    loadAndValidate() {
        this.log.debug(`Using config: ${this.configPath}`);

        if(!fs.existsSync(this.configPath)) {
            this.log.fatal('No config file was found, creating one...');
            fs.writeFileSync(this.configPath, JSON.stringify(this.parameters, null, 2));
            this.log.fatal('Empty config file was created. Populate it and start the bot again.');
            process.exit(1);
        }

        this.load();
        this.validate();
    }

    private load() {
        try {
            const parsed = JSON.parse(fs.readFileSync(this.configPath, { encoding: 'utf-8' }));
            this.parameters = Object.assign(this.parameters, parsed);
        } catch {
            throw new Error('Load failure. Corrupted config');
        }
    }

    private validate() {
        for(const [key, value] of Object.entries(this.parameters)) {
            if(!value) {
                throw new Error(`Validation failure. Missing value for key '${key}'`);
            }
        }
    }

    getValue<K extends keyof ConfigurationParameters>(key: K): string {
        return this.parameters[key];
    }

    getNodeEnv(): 'production' | 'development' {
        return this.getEnv('NODE_ENV') === 'production' ? 'production' : 'development';
    }

    getEnv(key: string): string | undefined {
        return process.env[key];
    }

    getVersion(): string {
        return this.getEnv('npm_package_version') || this.getEnv('version') || 'UNKNOWN';
    }

    isOwner(user: Discord.User): boolean {
        return this.getValue('owner-id') === user.id;
    }
}
