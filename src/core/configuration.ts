import Discord from 'discord.js';
import fs from 'fs';
import getLogger from '../utils/logger';

const log = getLogger('config');

class ConfigurationParameters {
    'token': string;
    'owner-id': string;
    'youtube-api-key': string;
    'reddit-client-id': string;
    'reddit-client-secret': string;
    'reddit-refresh-token': string;

    constructor() {
        this['token'] = '';
        this['owner-id'] = '';
        this['youtube-api-key'] = '';
        this['reddit-client-id'] = '';
        this['reddit-client-secret'] = '';
        this['reddit-refresh-token'] = '';
    }
}

export class Configuration {
    private settings: ConfigurationParameters;

    constructor() {
        this.settings = new ConfigurationParameters();
    }

    /**
     * Validate the config, throw error if config is invalid
     */
    validate() {
        log.trace('validate');
        this.load();
    }

    setConfigValue<K extends keyof ConfigurationParameters>(key: K, value: string) {
        log.warn(`setConfigValue called. This should be avoided.`);
        this.settings[key] = value;
        this.save();
    }

    getConfigValue<K extends keyof ConfigurationParameters>(key: K): string {
        log.trace('getConfigValue::' + key);
        this.load();
        return this.settings[key];
    }

    isDevEnv(): boolean {
        return this.getNodeEnv() === 'development';
    }

    getNodeEnv(): 'production' | 'development' {
        return process.env['NODE_ENV'] === 'production' ? 'production' : 'development';
    }

    getEnv(key: string): string | undefined {
        return process.env[key];
    }

    getVersion(): string {
        return this.getEnv('npm_package_version') || this.getEnv('version') || 'NO_VERSION';
    }

    isOwner(user: Discord.User): boolean {
        log.trace('isOwner::' + user.id);
        return this.getConfigValue('owner-id') === user.id;
    }

    /**
     * Given a jsonObject and a Class, checks if the json object has the same keys as the class
     * Returns undefined if jsonObject and class matches, otherwise returns name of key that is missing in jsonObject
     * @param jsonObject 
     * @param instanceType 
     */
    private getMissingKey<T>(jsonObject: Object, instanceType: { new(): T; }): string | undefined {
        // Check that all the properties of the JSON Object are also available in the Class.
        const instanceObject = new instanceType();
        for(let propertyName in instanceObject) {
            if(!jsonObject.hasOwnProperty(propertyName)) {
                // If any property in instance object is missing then we have a mismatch.
                return propertyName;
            }
        }
    }

    private save(): void {
        log.trace('Config::saveSettings');
        fs.writeFileSync('./config.json', JSON.stringify(this.settings, null, 2));
    }

    private load(): void {
        log.trace('load');

        if(!fs.existsSync('./config.json')) {
            log.fatal('No config file was found, creating one...');
            fs.writeFileSync('./config.json', JSON.stringify(this.settings, null, 2));
            log.fatal('Empty config file was created. Populate it and restart the bot.');
            process.exit(1);
        }

        try {
            this.settings = <ConfigurationParameters>JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf-8' }));
        } catch {
            log.fatal('Corrupted configuration file');
            process.exit(1);
        }

        try {
            const missingKey = this.getMissingKey(this.settings, ConfigurationParameters);
            if(missingKey) {
                throw new Error(`Config is missing key: ${missingKey}`);
            }
        } catch(error) {
            log.fatal('Error parsing config file: ' + error);
            process.exit(1);
        }
    }
}
