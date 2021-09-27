import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import getLogger from './logger';

const log = getLogger('Config');

class Settings {
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

class Config {
    configPath: string;
    settings: Settings;

    constructor(configPath: string = path.join(__dirname, '../../config.json')) {
        this.configPath = configPath;
        this.settings = new Settings();
        log.info(`Loading config: ${this.configPath}`);
        this.loadSettings();
    }

    private loadSettings() {
        log.trace(`loadSettings: ${this.configPath}`);

        if(!fs.existsSync(this.configPath)) {
            log.fatal('No config file was found, creating one...');
            fs.writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2));
            log.fatal('Empty config file was created. Populate it and restart the bot.');
            process.exit(1);
        }

        try {
            this.settings = <Settings>JSON.parse(fs.readFileSync(this.configPath, { encoding: 'utf-8' }));
        } catch {
            log.fatal('Corrupted config file, forced to exit');
            process.exit(1);
        }

        try {
            const missingKey = Config.getMissingKey(this.settings, Settings);
            if(missingKey) {
                throw new Error(`Config is missing key: ${missingKey}`);
            }
        } catch(error) {
            log.fatal('Error parsing config file: ' + error);
            process.exit(1);
        }
    }

    private saveSettings() {
        log.trace('Config::saveSettings');
        fs.writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2));
    }

    setConfigValue<K extends keyof Settings>(key: K, value: string) {
        log.warn(`setConfigValue called. This should be avoided.`);
        this.settings[key] = value;
        this.saveSettings();
    }

    getConfigValue<K extends keyof Settings>(key: K): string {
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

export default new Config();
