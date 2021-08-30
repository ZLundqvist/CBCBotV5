import Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import { createConnection } from "typeorm";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import config from "../utils/config";
import getLogger from '../utils/logger';
import { Guild } from "./entity/guild";

const log = getLogger(__dirname);

// Create dir
const PATH = path.resolve('./', 'database/');
if(!fs.existsSync(PATH)) {
    log.info(`Creating ${PATH}`);
    fs.mkdirsSync(PATH);
}

export async function connectDB(): Promise<void> {

    // const connection = createConnection();

    return new Promise((resolve, reject) => {
        createConnection(<SqliteConnectionOptions> {
            type: 'sqlite',
            database: './database/cbcbotv5.sqlite',
            entities: [
                __dirname + '/entity/**/*.ts',
                __dirname + '/entity/**/*.js'
            ],
            synchronize: true
        }).then((connection) => {
            log.info('Established connection to database');
            resolve();
        }).catch((error) => {
            reject();
            log.error(error);
        });
    });
}
/**
 * Adds guilds which bot is part of to DB if it isn't already in the db
 * @param client 
 */
export async function addGuilds(guilds: Discord.Guild[]): Promise<void> {
    for(let guild of guilds) {
        let dbGuild = await Guild.findOne(guild.id);

        if(!dbGuild) {
            dbGuild = new Guild();
            dbGuild.id = guild.id;
            dbGuild.prefix = config.getConfigValue('default-prefix');
            await dbGuild.save();
            log.info(`Added guild ${guild.name} to database.`);
        } else {
            log.debug(`Guild ${guild.name} already exists in database.`);
        }
    }
}
