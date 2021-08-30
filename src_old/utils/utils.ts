/**
 * Flattens and array of depth = 2
 * @param array 
 */
export function flatten<T>(array: T[][]): T[] {
    return array.reduce((accumulator, value) => accumulator.concat(value), [] as T[]);
};

/**
 * Given a list of strings, returns the longest string of them all
 * If multiple strings are the same length, returns the last one of them
 * @param strings 
 */
export function longest(strings: string[]): string {
    return strings.reduce((a, b) => { 
        if(!a)
            return b;
        if(!b)
            return a;

        return a.length > b.length ? a : b;
    });
}

export function getEnv(value: string): string | undefined {
    return process.env[value];
}

export function isDev(): boolean {
    return getEnv('NODE_ENV') === 'development';
}