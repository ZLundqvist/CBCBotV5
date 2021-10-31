import assert from 'assert';

const MPEG_BITRATES: { [key: string]: number } = {
    '0001': 32,
    '0010': 40,
    '0011': 48,
    '0100': 56,
    '0101': 64,
    '0110': 80,
    '0111': 96,
    '1000': 112,
    '1001': 128,
    '1010': 160,
    '1011': 192,
    '1100': 224,
    '1101': 256,
    '1110': 320
};

export function booleansToBitmask(...bits: boolean[]): string {
    let bitmask = '';
    for(const bit of bits) {
        if(bit) {
            bitmask += '1';
        } else {
            bitmask += '0';
        }
    }
    return bitmask;
}

export function resolveBitrate(bit1Set: boolean, bit2Set: boolean, bit3Set: boolean, bit4Set: boolean): number {
    const bitmask = booleansToBitmask(bit1Set, bit2Set, bit3Set, bit4Set);
    assert(bitmask in MPEG_BITRATES, `Unable to index MPEG_BITRATES using key: ${bitmask}`);
    return MPEG_BITRATES[bitmask];
}

export function formatHex(bytes: number[]): string {
    return bytes.map(byte => {
        return byte.toString(16).padStart(2, '0');
    }).join(' ');
}

export function formatAscii(bytes: number[]): string {
    return bytes.map(byte => {
        const char = String.fromCharCode(byte);
        if(char.charCodeAt(0) === 0) {
            return '.';
        } else {
            return char;
        }
    }).join('');
}

export function formatBits(bytes: number[]): string {
    return bytes.map(byte => {
        return byte.toString(2).padStart(8, '0');
    }).join(' ');
}
