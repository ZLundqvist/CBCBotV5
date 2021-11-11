import assert from 'assert';
import { formatAscii, formatBits, formatHex } from './helpers';

export class MP3Bytes {
    private bytes: number[];
    readonly offset: number;

    constructor(bytes: number[], offset: number) {
        this.bytes = bytes;
        this.offset = offset;
    }

    /**
     * First basic check in order to determine if current 4 bytes contain the pattern for frame synchronization
     * @returns 
     */
    isFrameSynchronizer(): boolean {
        assert(this.bytes.length === 4, 'Frame header must contain 4 bytes');

        const isFrameSync =
            (this.bytes[0] & 0xFF) === 0xFF &&
            (this.bytes[1] & 0xE0) === 0xE0;

        return isFrameSync;
    }

    byteAt(offset: number): number {
        return this.bytes[offset];
    }

    isBitSet(byteOffset: number, bit: number): boolean {
        assert(bit >= 0 && bit <= 7, 'Bit must be in range 0-7');

        const byte = this.bytes[byteOffset];

        return ((byte >> bit) & 1) === 1;
    }

    get length(): number {
        return this.bytes.length;
    }

    get asAscii(): string {
        return formatAscii(this.bytes);
    }

    get asHex(): string {
        return formatHex(this.bytes);
    }

    get asBits(): string {
        return formatBits(this.bytes);
    }
}


