import log4js from 'log4js';
import { formatLoggerName } from './formatting';

const DEFAULT_LEVEL: log4js.Level = log4js.levels.DEBUG;

type TimeMeasurement = {
    /**
     * Timestamp of start of time measurement in milliseconds
     */
    startTimestamp: number;

    /**
     * The {@link log4js.Level} to use when logging result at end of measurement
     */
    level: log4js.Level;
};

/**
 * A wrapper for the {@link log4js.Level} class that adds some extended functionality
 */
export class LoggerWrapper {
    private readonly logger: log4js.Logger;
    private readonly activeMeasurements: Map<string, TimeMeasurement> = new Map();

    constructor(name: string) {
        this.logger = log4js.getLogger(name);
    }

    get name(): string {
        return this.logger.category;
    }

    set level(level: log4js.Level | string) {
        this.logger.level = level;
    }

    get level(): log4js.Level | string {
        return this.logger.level;
    }

    info(message: any, ...args: any[]): void {
        this.logger.info(message, ...args);
    }

    warn(message: any, ...args: any[]): void {
        this.logger.warn(message, ...args);
    }

    error(message: any, ...args: any[]): void {
        this.logger.error(message, ...args);
    }

    debug(message: any, ...args: any[]): void {
        this.logger.debug(message, ...args);
    }

    fatal(message: any, ...args: any[]): void {
        this.logger.fatal(message, ...args);
    }

    trace(message: any, ...args: any[]): void {
        this.logger.trace(message, ...args);
    }

    /**
     * Log using a dynamic {@link log4js.Level}.
     */
    log(level: log4js.Level, ...args: any[]): void {
        this.logger.log(level, ...args);
    }

    time(key: string, level = log4js.levels.INFO): void {
        if(this.activeMeasurements.has(key)) {
            this.warn(`Timer already exists for key: ${key}`);
            return;
        }

        this.activeMeasurements.set(key, {
            startTimestamp: performance.now(),
            level: level
        });
    }

    timeEnd(key: string): void {
        const measurement = this.activeMeasurements.get(key);

        if(!measurement) {
            this.warn(`Timer does not exist for key: ${key}`);
            return;
        }

        const elapsedMs = Math.ceil(performance.now() - measurement.startTimestamp);
        this.log(measurement.level, `${key}: ${elapsedMs}ms`);
        this.activeMeasurements.delete(key);
    }
}

export function getLoggerWrapper(name: string, level: log4js.Level = DEFAULT_LEVEL): LoggerWrapper {
    const logger = new LoggerWrapper(formatLoggerName(name));
    logger.level = level;
    return logger;
};
