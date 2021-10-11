import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Stream } from 'stream';
import validator from 'validator';
import getLogger from '../utils/logger';

const log = getLogger('resource-handler');

export class ResourceHandler {
    private root!: string;
    private sfx_folder!: string;
    private img_folder!: string;

    constructor() {
        this.root = path.resolve('./resources');
        this.sfx_folder = path.join(this.root, 'sfx');
        this.img_folder = path.join(this.root, 'img');
    }

    setup() {
        if(!fs.existsSync(this.root)) {
            fs.mkdirSync(this.root);
            log.debug(`Created resource directory: ${this.root}`);
        }

        if(!fs.existsSync(this.sfx_folder)) {
            fs.mkdirSync(this.sfx_folder);
            log.debug(`Created sfx folder: ${this.sfx_folder}`);
        }
        log.info(`SFX folder contains ${fs.readdirSync(this.sfx_folder).length} files.`);

        if(!fs.existsSync(this.img_folder)) {
            fs.mkdirSync(this.img_folder);
            log.debug(`Created image folder: ${this.img_folder}`);
        }
        log.info(`Image folder contains ${fs.readdirSync(this.img_folder).length} files.`);
    }

    /**
     * Returns all names of images in the image resource folder (including extensions)
     * @returns 
     */
    getImages(): string[] {
        return fs.readdirSync(this.img_folder);
    }

    /**
     * Returns all names of SFXs in the sfx resource folder (including extensions)
     * @returns 
     */
    getSFXNamesExt(): string[] {
        return fs.readdirSync(this.sfx_folder);
    }

    /**
     * Returns all names of SFXs in the sfx resource folder (excluding extensions)
     * @returns 
     */
    getSFXNames(): string[] {
        return this.getSFXNamesExt().map(file => {
            return file.replace('.mp3', '');
        });
    }

    /**
     * Returns the absolute path (including extension) of the sfx with the given name (without extension)
     * @param name 
     * @returns 
     */
    getSFXPath(name: string): string | undefined {
        const sfxs = this.getSFXNamesExt();

        for(let sfx of sfxs) {
            if(sfx === name || sfx.replace('.mp3', '') === name) {
                return path.join(this.sfx_folder, sfx);
            }
        }
    }

    /**
     * Resolve the absolute path of an image with the given name (including extension). Throws error if image does not exist
     * @param name 
     * @returns 
     */
    getImagePath(name: string): string {
        const imgs = this.getImages();

        for(let img of imgs) {
            if(img === name) {
                return path.join(this.img_folder, img);
            }
        }

        throw new Error(`File not found: ${name}`);
    }

    /**
     * Checks if an SFX with the given name exists
     * @param name 
     * @returns 
     */
    sfxExists(name: string): boolean {
        return this.getSFXPath(name) !== undefined;
    }

    /**
     * Checks if an image with the given name exists (including extension)
     * @param name 
     * @returns 
     */
    imageExists(name: string): boolean {
        try {
            this.getImagePath(name);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Given a URL, downloads it and adds the file to sfx folder
     */
    async downloadSFX(filename: string, link: string): Promise<void> {

        if(!validator.isURL(link)) {
            throw new Error(`Provided link is not a valid URI: ${link}`);
        }

        if(path.extname(link) !== '.mp3') {
            throw new Error(`File to download must have .mp3 extension: ${link}`);
        }

        if(path.extname(filename) !== '.mp3') {
            throw new Error(`File must have .mp3 extension: ${filename}`);
        }

        if(this.sfxExists(filename)) {
            throw new Error(`File already exists with name: ${filename}`);
        }

        const response = await axios.get<Stream>(link, {
            responseType: 'stream'
        });

        response.data.pipe(fs.createWriteStream(path.join(this.sfx_folder, filename)));
    }

    async addSFX(filename: string, data: Buffer): Promise<void> {
        if(this.sfxExists(filename)) throw new Error('SFX already exists');
        fs.writeFileSync(path.join(this.sfx_folder, filename), data);
    }

    /**
     * 
     */
    removeSFX(name: string): void {
        const sfx = this.getSFXPath(name);

        if(!sfx) {
            throw new Error(`SFX does not exist: ${name}`);
        }

        fs.unlinkSync(sfx);
    }
}
