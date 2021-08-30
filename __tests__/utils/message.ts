import * as message from '../../src/utils/message';

describe('messageHasKeyword', () => {
    test('returns false on empty string', () => {
        expect(message.messageHasKeyword('', 'keyword')).toBeFalsy();
    });

    test('returns false on string without keyword', () => {
        expect(message.messageHasKeyword('string without the important word', 'keyword')).toBeFalsy();
        expect(message.messageHasKeyword('keyworda', 'keyword')).toBeFalsy();
    });

    test('returns false on string that does not begin with keyword', () => {
        expect(message.messageHasKeyword('asdf keyword', 'keyword')).toBeFalsy();
    });

    test('returns true that is the keyword', () => {
        expect(message.messageHasKeyword('keyword', 'keyword')).toBeTruthy();
    });

    test('returns true on string with keywords multiple times', () => {
        expect(message.messageHasKeyword('keyword keyword keyword asdf keyword', 'keyword')).toBeTruthy();
    });
});