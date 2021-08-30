import * as time from '../../src/utils/time';


describe('secondsToMS', () => {
    it('properly converts 1 minute', () => {
        expect(time.secondsToMS(60)).toEqual('1:00');
    });
    it('properly converts 0 seconds', () => {
        expect(time.secondsToMS(0)).toEqual('0:00');
    });
    it('properly converts other random seconds', () => {
        expect(time.secondsToMS(121)).toEqual('2:01');
        expect(time.secondsToMS(1432)).toEqual('23:52');
        expect(time.secondsToMS(3502)).toEqual('58:22');
        expect(time.secondsToMS(7202)).toEqual('120:02');
    });
});
