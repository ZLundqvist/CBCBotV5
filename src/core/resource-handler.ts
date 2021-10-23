import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import { getMP3Metadata } from '../utils/file';
import getLogger from '../utils/logger';

const log = getLogger('resource-handler');

export interface LocalResource {
    /**
     * Filename of resource, excluding extension
     */
    name: string;

    /**
     * Filename of resource, including extension
     */
    base: string;

    /**
     * Full path of resource, including filename
     */
    path: string;
};

export interface SFXResource extends LocalResource {
    metadata?: SFXMetadata;
};

export type SFXMetadata = {
    /**
     * Length in number of seconds
     */
    length: number;
};

type ImageResource = 'soundcloud-logo' | 'yt-logo';

export class ResourceHandler {
    private readonly rootDir: string;
    private readonly customSFXDir: string;
    private readonly sfxDir: string;
    private readonly imageDir: string;
    private readonly sfxMetadataCache: Discord.Collection<string, SFXMetadata>;

    /**
     * @param rootDir Relative path to root directory of resource
     */
    constructor(rootDir: string) {
        this.rootDir = path.resolve(rootDir);
        this.customSFXDir = path.join(this.rootDir, 'custom_sfx');
        this.sfxDir = path.join(this.rootDir, 'sfx');
        this.imageDir = path.join(this.rootDir, 'img');
        this.sfxMetadataCache = new Discord.Collection();
    }

    setup() {
        log.debug(`Using root directory: ${this.rootDir}`);

        if(!fs.existsSync(this.customSFXDir)) {
            fs.mkdirSync(this.customSFXDir);
            log.debug(`Created custom SFX directory: ${this.customSFXDir}`);
        }

        log.debug(`Custom SFX count: ${fs.readdirSync(this.customSFXDir).length}`);
        log.debug(`SFX count: ${fs.readdirSync(this.sfxDir).length}`);
        log.debug(`Image count: ${fs.readdirSync(this.imageDir).length}`);
    }

    /**
     * Returns resource of image with given name
     * Throws if image cannot be found
     * @returns 
     */
    getImage(name: ImageResource): LocalResource {
        const images = this.getFilesInDir(this.imageDir);
        const image = images.find(img => img.name === name);

        if(!image)
            throw new Error(`Missing image: ${name}`);

        return image;
    }

    /**
     * Returns resource of SFX with given name
     * @returns 
     */
    getSFX(name: string): SFXResource | undefined {
        return this.getSFXs().find(img => img.name === name);
    }

    /**
     * Returns a sorted list of SFX resources
     * @returns 
     */
    getSFXs(): SFXResource[] {
        const sfxs = this.getFilesInDir(this.sfxDir).concat(this.getFilesInDir(this.customSFXDir));
        return sfxs
            .map(sfx => {
                return {
                    ...sfx,
                    metadata: this.getSFXMetadata(sfx)
                }
            }).sort((a, b) => {
                return a.base.localeCompare(b.name);
            });
    }

    private getSFXMetadata(sfx: SFXResource): SFXMetadata | undefined {
        const cached = this.sfxMetadataCache.get(sfx.name);
        if(cached) {
            return cached;
        }

        const metadata = getMP3Metadata(sfx);
        if(metadata) {
            this.sfxMetadataCache.set(sfx.name, metadata);
            return metadata;
        }
    }

    private getFilesInDir(dirPath: string): LocalResource[] {
        const files = fs.readdirSync(dirPath);

        return files.map(file => {
            const parsed = path.parse(path.resolve(dirPath, file));

            return {
                name: parsed.name,
                base: parsed.base,
                path: `${parsed.dir}/${parsed.base}`
            };
        });
    }
}
