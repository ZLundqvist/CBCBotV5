import * as random from '../../src/utils/random';

describe('roll', () => {
    it('should return values withing specified interval', () => {
        // Is not deterministic
        for (let i = 0; i < 10000; i++) {
            const value = random.roll(0, 100);

            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
        }

        for (let i = 0; i < 10000; i++) {
            const value = random.roll(0, 2);

            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(2);
        }

        for (let i = 0; i < 10000; i++) {
            const value = random.roll(0, 2);

            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(2);
        }
    });

    it('should throw error if min > max', () => {
        expect(() => {
            random.roll(20, 1);
        }).toThrow();

        expect(() => {
            random.roll(1, 0);
        }).toThrow();

        expect(() => {
            random.roll(0, -20);
        }).toThrow();
    });

    it('should throw on negative values', () => {
        expect(() => {
            random.roll(-1, 1);
        }).toThrow();

        expect(() => {
            random.roll(-1, -1);
        }).toThrow();

        expect(() => {
            random.roll(1, -1);
        }).toThrow();
    });

    it('should allow min = max', () => {
        expect(random.roll(1, 1)).toBe(1);
        expect(random.roll(0, 0)).toBe(0);
    })
});

describe('pickRandom', () => {
    it('should return a random item from the source array', () => {
        const source = ['1', '2', '3', '4', '5', '6', '7'];

        for (let i = 0; i < 1000; i++) {
            const pick = random.pickRandom(source);

            if(!pick)
                continue;

            expect(source.includes(pick));
        }
    });

    it('should return undefined when given empty array', () => {
        const source: string[] = [];

        expect(random.pickRandom(source)).toBeUndefined();
    });

    it('should return only item in array with one item', () => {
        const source = [ 'only item' ];

        for(let i = 0; i < 1000; i++) {
            expect(random.pickRandom(source)).toEqual('only item');
        }
    });
});

describe('shuffle', () => {
    it('shuffles an array', () => {
        const array = [1, 2, 3];
        const shuffled = random.shuffle(array);

        // They are two different arrays (in memory)
        expect(array === shuffled).toBeFalsy();

        // Same length
        expect(array.length).toBe(shuffled.length);

        // Sum of arrays are equal
        expect(array.reduce((acc, cur) => acc += cur, 0)).toBe(shuffled.reduce((acc, cur) => acc += cur, 0));
    });

    it('return empty array when input array is empty', () => {
        expect(random.shuffle([]).length).toBe(0);
    });
});