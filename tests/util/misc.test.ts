import { getLongestString } from '../../src/utils/misc';

describe('getLongestString', () => {
    it('throws error on empty input list', () => {
        expect(() => {
            getLongestString([]);
        }).toThrow();
    });

    it('returns only item in list with one item', () => {
        const result = getLongestString(['testing-string']);
        expect(result).toBe('testing-string');
    });

    it('returns longest string in list with multiple strings', () => {
        expect(getLongestString(['a', 'ab'])).toBe('ab');
        expect(getLongestString(['ab', 'abc', 'a'])).toBe('abc');
        expect(getLongestString(['abc', 'ab', 'a'])).toBe('abc');
        expect(getLongestString(['abcdefghijklmno', 'abcdefghijklmnop'])).toBe('abcdefghijklmnop');
    });

    it('returns last string when input has multiple string of same length', () => {
        expect(getLongestString(['aaa', 'bbb', 'ccc'])).toBe('ccc');
        expect(getLongestString(['aaa', 'bbbb', 'ccc', 'dddd'])).toBe('dddd');
        expect(getLongestString(['aaa', 'bb', 'cc', 'ddd'])).toBe('ddd');
    });
});
