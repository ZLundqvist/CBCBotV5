/**
 * Given a list of strings, returns the longest string of them all
 * If multiple strings are the same length, returns the last one of them
 * @param strings 
 */
export function getLongestString(strings: string[]): string {
    return strings.reduce((a, b) => { 
        if(!a)
            return b;
        if(!b)
            return a;

        return a.length > b.length ? a : b;
    });
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
