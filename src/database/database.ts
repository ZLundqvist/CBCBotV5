import fs from 'fs-extra';
import path from 'path';
import * as typeorm from 'typeorm';
import getLogger from '@utils/logger';

const log = getLogger('Database');

// Create dir
const PATH = path.resolve('./', 'database/');
if(!fs.existsSync(PATH)) {
    log.info(`Creating ${PATH}`);
    fs.mkdirsSync(PATH);
}

export async function createConnection(): Promise<void> {
    const connection = await typeorm.createConnection({
        type: 'sqlite',
        database: './database/cbcbotv5.sqlite',
        entities: [
            __dirname + '/entity/**/*.ts',
            __dirname + '/entity/**/*.js'
        ],
        synchronize: true
    });

    log.info('Established connection to database: ' + connection.options.database);
}

export async function closeConnection(): Promise<void> {
    const conn = typeorm.getConnection();

    if(conn) {
        log.info('Closing database connection');
        await conn.close();
    }
}
