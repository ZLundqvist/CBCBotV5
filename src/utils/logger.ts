import log4js from 'log4js';
import { formatLoggerName } from './formatting';

type TimeMeasurement = {
    /**
     * Timestamp of start of time measurement in milliseconds
     */
    startTimestamp: number;

    level: log4js.Level;
};

export class LoggerWrapper {
    private readonly _logger: log4js.Logger;
    private readonly _activeMeasurements: Map<string, TimeMeasurement>;

    constructor(name: string) {
        this._logger = log4js.getLogger(name);
        this._activeMeasurements = new Map();
    }

    get name(): string {
        return this._logger.category;
    }

    set level(level: log4js.Level | string) {
        if(typeof level === 'string') {
            this._logger.level = level;
        } else {
            this._logger.level = level.levelStr;
        }
    }

    get level(): string {
        return this._logger.level;
    }

    info(message: any, ...args: any[]): void {
        this._logger.info(message, ...args);
    }

    warn(message: any, ...args: any[]): void {
        this._logger.warn(message, ...args);
    }

    error(message: any, ...args: any[]): void {
        this._logger.error(message, ...args);
    }

    debug(message: any, ...args: any[]): void {
        this._logger.debug(message, ...args);
    }

    fatal(message: any, ...args: any[]): void {
        this._logger.fatal(message, ...args);
    }

    trace(message: any, ...args: any[]): void {
        this._logger.trace(message, ...args);
    }

    /**
     * Log if given level is enabled.
     */
    log(level: log4js.Level, ...args: any[]): void {
        this._logger.log(level, ...args);
    }

    time(key: string, level = log4js.levels.INFO): void {
        const measurement = this._activeMeasurements.get(key);

        if(measurement) {
            this.warn(`Time is already being measured for key: ${key}`);
            return;
        }

        this._activeMeasurements.set(key, {
            startTimestamp: performance.now(),
            level: level
        });
    }

    timeEnd(key: string): void {
        const measurement = this._activeMeasurements.get(key);

        if(!measurement) {
            this.warn(`Time is not being measured for key: ${key}`);
            return;
        }

        const elapsedMs = Math.ceil(performance.now() - measurement.startTimestamp);
        this.log(measurement.level, `${key}: ${elapsedMs}ms`);
        this._activeMeasurements.delete(key);
    }
}

export function getLoggerWrapper(name: string, level: log4js.Level = log4js.levels.ALL): LoggerWrapper {
    const logger = new LoggerWrapper(formatLoggerName(name));
    logger.level = level;
    return logger;
};
