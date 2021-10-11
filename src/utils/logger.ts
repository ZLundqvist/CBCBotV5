import log4js from 'log4js';
import path from 'path';

let level = 'debug';
if(process.env.NODE_ENV === 'production') {
    level = 'info';
} else if(process.env.NODE_ENV === 'test') {
    level = 'error';
}

const logger = log4js.getLogger(__filename);
logger.info(`Logger level: ${logger.level}`);

export default function getLogger(name: string) {
    // Formats the name so that redundant paths and extensions are removed
    let formattedName = path.basename(name);
    if(formattedName.includes('.')) {
        formattedName = formattedName.split('.')[0];
    }

    const logger = log4js.getLogger(path.basename(formattedName));
    logger.level = level;

    return logger;
};
