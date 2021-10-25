import fs from 'fs';
import { LocalResource } from '../../core/resource-handler';
import { MP3Metadata } from '../audio';
import { MP3Bytes } from './mp3-bytes';
import { MP3FrameHeader, ParsedFrameHeader } from './mp3-frame-header';

export class MP3Parser {
    private buffer: Buffer;

    constructor(sfx: LocalResource) {
        this.buffer = fs.readFileSync(sfx.path);
    }

    getMetadata(): MP3Metadata | undefined {
        if(!this.isID3()) {
            return;
        }

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

    private isID3(): boolean {
        const magic = this.readBytes(0, 3);
        return magic.asAscii === 'ID3';
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
