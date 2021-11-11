import { LocalResource } from '../../core/resource-handler';
import { MP3Parser } from './mp3-parser/mp3-parser';

export type MP3Metadata = {
    /**
     * Length in number of seconds
     */
    length: number;
};


export function getMP3Metadata(sfx: LocalResource): MP3Metadata | undefined {
    const parser = new MP3Parser(sfx.path);

    return parser.getMetadata();
}

export * from './soundcloud-wrapper';
export * from './youtube-wrapper';

