import * as util from '../../src/utils/utils';

test('flatten', () => {
    const array1: string[][] = [
        ['123', '1234'],
        ['12345',  '12345'],
        ['123456', '1234567', '12345678', '123456789'],
        ['12345678910', '1234567891011']
    ];
    expect(util.flatten(array1)).toStrictEqual(['123', '1234', '12345', '12345', '123456', '1234567', '12345678', '123456789', '12345678910', '1234567891011']);
    const array2: string[][] = [
        [],
        ['a'],
        ['a', 'b', 'c']
    ]; 
    expect(util.flatten(array2)).toStrictEqual(['a', 'a', 'b', 'c']);
    const array3: string[][] = [
        [],
        [],
        []
    ];
    expect(util.flatten(array3)).toStrictEqual([]);
    const array4: string[][] = [];
    expect(util.flatten(array4)).toStrictEqual([]);
});

test('longest', () => {
    expect(util.longest(['asdfasdfasdf', 'asdfasdf', 'asdfasdfsadfsadf', '', 'kjahgdfkjgfdslagkfjdlhkljdf'])).toBe('kjahgdfkjgfdslagkfjdlhkljdf');
    expect(util.longest(['', '', '', '', ''])).toBe('');
    expect(util.longest(['', '', '', '', 'asd'])).toBe('asd');
    expect(util.longest(['1234', '1235', '1236', '1237', '1238'])).toBe('1238');
    expect(() =>  {
        util.longest([]);
    }).toThrow();
});
