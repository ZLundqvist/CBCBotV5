import { secondsToMS } from '../../src/utils/time';

describe('secondsToMS', () => {
    it('converts 60 seconds to 1:00', () => {
        expect(secondsToMS(60)).toEqual('1:00');
    });

    it('converts 0 seconds to 0:00', () => {
        expect(secondsToMS(0)).toEqual('0:00');
    });

    it('converts into minutes and seconds correctly', () => {
        expect(secondsToMS(121)).toEqual('2:01');
        expect(secondsToMS(1432)).toEqual('23:52');
        expect(secondsToMS(3502)).toEqual('58:22');
    });

    it('converts input larger than 100 minutes correctly', () => {
        expect(secondsToMS(7202)).toEqual('120:02');
    });
});
