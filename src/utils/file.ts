import { LocalResource, SFXMetadata } from '../core/resource-handler';
import { MP3Parser } from './mp3-parser/mp3-parser';

export function getMP3Metadata(sfx: LocalResource): SFXMetadata | undefined {
    const parser = new MP3Parser(sfx);

    return parser.getMetadata();
}
