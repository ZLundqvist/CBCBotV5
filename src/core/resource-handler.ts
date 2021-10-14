import fs from 'fs';
import path from 'path';
import getLogger from '../utils/logger';

const log = getLogger('resource-handler');

type Resource = {
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

type SFXResource = 'hiagain' | 'pc' | string;
type ImageResource = 'soundcloud-logo' | 'yt-logo';

export class ResourceHandler {
    private readonly rootDir: string;
    private readonly customSFXDir: string;
    private readonly sfxDir: string;
    private readonly imageDir: string;

    /**
     * @param rootDir Relative path to root directory of resource
     */
    constructor(rootDir: string) {
        this.rootDir = path.resolve(rootDir);
        this.customSFXDir = path.join(this.rootDir, 'custom_sfx');
        this.sfxDir = path.join(this.rootDir, 'sfx');
        this.imageDir = path.join(this.rootDir, 'img');
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
    getImage(name: ImageResource): Resource {
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
    getSFX(name: SFXResource): Resource | undefined {
        return this.getSFXs().find(img => img.name === name);
    }

    /**
     * Returns a sorted list of SFX resources
     * @returns 
     */
    getSFXs(): Resource[] {
        const sfxs = this.getFilesInDir(this.sfxDir).concat(this.getFilesInDir(this.customSFXDir));
        return sfxs.sort((a, b) => {
            return a.base.localeCompare(b.name);
        });
    }

    private getFilesInDir(dirPath: string): Resource[] {
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
