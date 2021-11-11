import { resolveBitrate } from './helpers';
import { MP3Bytes } from './mp3-bytes';

export type MPEGVersion = '2.5' | '2' | '1';
export type MPEGLayer = '1' | '2' | '3';
export type MPEGSRF = 44100 | 48000 | 32000

export type ParsedFrameHeader = {
    version: MPEGVersion;
    layer: MPEGLayer;
    CRC: boolean;
    bitrate: number;
    SRF: MPEGSRF;
};

// /resources/sfx/test.mp3: Audio file with ID3 version 2.4.0, contains:MPEG ADTS, layer III, v1, 192 kbps, 48 kHz, Stereo

export class MP3FrameHeader {
    private bytes: MP3Bytes;

    constructor(bytes: MP3Bytes) {
        this.bytes = bytes;
    }

    /**
     * Validates and parses the frame that is presumed to exist in the bytes passed in the constructor
     * @returns 
     */
    parse(): ParsedFrameHeader | null {
        try {
            return {
                'version': this.parseMPEGVersion(),
                'layer': this.parseLayer(),
                'CRC': this.parseCRCProtection(),
                'bitrate': this.parseBitrate(),
                'SRF': this.parseSRF()
            };
        } catch(error) {
            return null;
        }
    }

    private parseMPEGVersion(): MPEGVersion {
        const bit1Set = this.bytes.isBitSet(1, 4);
        const bit2Set = this.bytes.isBitSet(1, 3);

        if(bit1Set && bit2Set) {
            return '1';
        } else if(!bit1Set && bit2Set) {
            throw new Error('Reserved value encountered');
        } else if(bit1Set && !bit2Set) {
            return '2';
        } else if(!bit1Set && !bit2Set) {
            return '2.5';
        } else {
            throw new Error('Error parsing MPEG Version');
        }
    }

    private parseLayer(): MPEGLayer {
        const bit1Set = this.bytes.isBitSet(1, 2);
        const bit2Set = this.bytes.isBitSet(1, 1);

        if(bit1Set && bit2Set) {
            return '1';
        } else if(!bit1Set && bit2Set) {
            return '3';
        } else if(bit1Set && !bit2Set) {
            return '2';
        } else if(!bit1Set && !bit2Set) {
            throw new Error('Reserved value encountered');
        } else {
            throw new Error('Error parsing MPEG Layer');
        }
    }

    private parseCRCProtection(): boolean {
        const bitSet = this.bytes.isBitSet(1, 0);
        return !bitSet;
    }

    private parseBitrate(): number {
        const bit1Set = this.bytes.isBitSet(2, 7);
        const bit2Set = this.bytes.isBitSet(2, 6);
        const bit3Set = this.bytes.isBitSet(2, 5);
        const bit4Set = this.bytes.isBitSet(2, 4);

        if(bit1Set && bit2Set && bit3Set && bit4Set) {
            throw new Error('Reserved value encountered');
        }

        if(!bit1Set && !bit2Set && !bit3Set && !bit4Set) {
            throw new Error('Unsupported value encountered (free)');
        }

        return resolveBitrate(bit1Set, bit2Set, bit3Set, bit4Set);
    }

    private parseSRF(): MPEGSRF {
        const bit1Set = this.bytes.isBitSet(2, 3);
        const bit2Set = this.bytes.isBitSet(2, 2);

        if(bit1Set && bit2Set) {
            throw new Error('Reserved value encountered');
        } else if(!bit1Set && bit2Set) {
            return 48000;
        } else if(bit1Set && !bit2Set) {
            return 32000;
        } else {
            return 44100;
        }
    }
}
