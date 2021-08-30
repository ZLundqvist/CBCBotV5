import log4js from 'log4js';
import path from 'path';

let level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

if(process.env.NODE_ENV === 'test') {
    level = 'error';
}

const logger = log4js.getLogger(__filename);
logger.info(`Logger level: ${logger.level}`);

export default function getLogger(filename: string) {
    const logger = log4js.getLogger(path.basename(filename));
    logger.level = level;

    return logger;
};
