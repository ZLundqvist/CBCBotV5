import log4js from 'log4js';
import getLogger from './logger';

const log = getLogger('Time');

/**
 * Converts seconds to mm:ss
 * @param s 
 */
export function secondsToMS(s: number): string {
    let seconds: number | string = s;
    const minutes: number | string = Math.floor(seconds / 60).toString();
    seconds %= 60;
    if(seconds >= 0) {
        seconds = Math.floor(seconds);
        seconds = seconds.toString();
        if(seconds.length === 1) {
            seconds = `0${seconds}`;
        }
    }
    return `${minutes}:${seconds}`;
}

export const timeMeasurement = {
    _cache: {} as { [key: string]: number },
    start: function (key: string) {
        if(!this._cache[key]) {
            this._cache[key] = Date.now();
        } else {
            log.warn(`Time is already being measured for key: ${key}`);
        }
    },
    end: function (key: string, customLog?: log4js.Logger) {
        if(this._cache[key]) {
            const diff = (Date.now() - this._cache[key]);

            if(customLog) {
                customLog.info(`${key}: ${diff}ms`);
            } else {
                log.info(`${key}: ${diff}ms`);
            }
            
            delete this._cache[key];
        } else {
            log.warn(`Time is not being measured for key: ${key}`);
        }
    }
};
