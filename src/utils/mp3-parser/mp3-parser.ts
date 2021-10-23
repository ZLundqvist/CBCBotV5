import assert from 'assert';
import fs from 'fs';
import { LocalResource, SFXMetadata } from '../../core/resource-handler';
import { MP3Bytes } from './mp3-bytes';
import { MP3FrameHeader, ParsedFrameHeader } from './mp3-frame-header';

export class MP3Parser {
    private buffer: Buffer;

    constructor(sfx: LocalResource) {
        this.buffer = fs.readFileSync(sfx.path);
    }

    getMetadata(): SFXMetadata | undefined {
        this.ensureID3();

        const firstFrame = this.findAndParseFirstFrame();

        if(!firstFrame) {
            return;
        }

        return {
            length: this.estimateLength(firstFrame.bitrate)
        };
    }

    private estimateLength(bitrate: number): number {
        const byteCount = this.buffer.length;

        // Length = bits / bits per second
        return Math.ceil((byteCount * 8) / (bitrate * 1000));
    }

    private ensureID3() {
        const magic = this.readBytes(0, 3);
        assert(magic.asAscii === 'ID3');
    }

    private findAndParseFirstFrame(): ParsedFrameHeader | undefined {
        let currentByte = 0;
        while(currentByte < (this.buffer.length - 4)) {
            const bytes = this.readBytes(currentByte, 4);

            if(bytes.isFrameSynchronizer()) {
                const frameHeader = new MP3FrameHeader(bytes).parse();

                if(frameHeader) {
                    return frameHeader;
                }

            }
            currentByte += 1;
        }
    }

    private readBytes(offset: number, bytesToRead: number): MP3Bytes {
        const bytes: number[] = [];

        for(let i = 0; i < bytesToRead; i++) {
            bytes.push(this.buffer.readUInt8(offset + i));
        }

        return new MP3Bytes(bytes, offset);
    }
}
