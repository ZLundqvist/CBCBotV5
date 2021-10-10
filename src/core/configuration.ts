import getLogger from '@utils/logger';
import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';

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

class Configuration {
    configPath: string;
    settings: ConfigurationParameters;

    constructor(configPath: string = path.join(__dirname, '../../config.json')) {
        this.configPath = configPath;
        this.settings = new ConfigurationParameters();
        log.info(`Loading config: ${this.configPath}`);
        this.loadSettings();
    }

    private loadSettings(): void {
        log.trace(`loadSettings: ${this.configPath}`);

        if(!fs.existsSync(this.configPath)) {
            log.fatal('No config file was found, creating one...');
            fs.writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2));
            log.fatal('Empty config file was created. Populate it and restart the bot.');
            process.exit(1);
        }

        try {
            this.settings = <ConfigurationParameters>JSON.parse(fs.readFileSync(this.configPath, { encoding: 'utf-8' }));
        } catch {
            log.fatal('Corrupted config file, forced to exit');
            process.exit(1);
        }

        try {
            const missingKey = Configuration.getMissingKey(this.settings, ConfigurationParameters);
            if(missingKey) {
                throw new Error(`Config is missing key: ${missingKey}`);
            }
        } catch(error) {
            log.fatal('Error parsing config file: ' + error);
            process.exit(1);
        }
    }

    private saveSettings(): void {
        log.trace('Config::saveSettings');
        fs.writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2));
    }

    setConfigValue<K extends keyof ConfigurationParameters>(key: K, value: string) {
        log.warn(`setConfigValue called. This should be avoided.`);
        this.settings[key] = value;
        this.saveSettings();
    }

    getConfigValue<K extends keyof ConfigurationParameters>(key: K): string {
        log.trace('getConfigValue::' + key);
        this.loadSettings();
        return this.settings[key];
    }

    /**
     * Given a jsonObject and a Class, checks if the json object has the same keys as the class
     * Returns undefined if jsonObject and class matches, otherwise returns name of key that is missing in jsonObject
     * @param jsonObject 
     * @param instanceType 
     */
    private static getMissingKey<T>(jsonObject: Object, instanceType: { new(): T; }): string | undefined {
        // Check that all the properties of the JSON Object are also available in the Class.
        const instanceObject = new instanceType();
        for(let propertyName in instanceObject) {
            if(!jsonObject.hasOwnProperty(propertyName)) {
                // If any property in instance object is missing then we have a mismatch.
                return propertyName;
            }
        }
    }

    isOwner(user: Discord.User): boolean {
        log.trace('isOwner::' + user.id);
        return this.getConfigValue('owner-id') === user.id;
    }

}

export default new Configuration();
