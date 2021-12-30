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
