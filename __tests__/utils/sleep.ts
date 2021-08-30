import sleep from '../../src/utils/sleep';

const MAX_TIME_DIFF = 50;

describe('sleep', () => {
    test('sleeps for 1 seconds', async() => {
        const SLEEP_TIME = 1000;

        const start = Date.now();
        await sleep(SLEEP_TIME);
        const diff = Date.now() - start;

        expect(isWithinBounds(diff - SLEEP_TIME)).toBeTruthy();
    }, 1500);

    test('sleeps for 0 seconds', async() => {
        const SLEEP_TIME = 0;

        const start = Date.now();
        await sleep(SLEEP_TIME);
        const diff = Date.now() - start;

        expect(isWithinBounds(diff - SLEEP_TIME)).toBeTruthy();
    }, 10);
});

function isWithinBounds(diff: number): boolean {
    return Math.abs(diff) <= MAX_TIME_DIFF;
}