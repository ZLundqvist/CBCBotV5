import fs from 'fs-extra';
import path from 'path';
import validator from 'validator';
import getLogger from '../utils/logger';
import axios from 'axios';

const log = getLogger(__filename);

/**
 * Singleton class
 */
class ResourceHandler {

    private initialized: boolean;
    private root!: string;
    private sfx_folder!: string;
    private img_folder!: string;

    constructor() {
        this.initialized = false;
    }

    init(dir: string): void {
        log.debug('Initializing ResourceHandler');
        this.setRoot(dir);

        if(!fs.existsSync(this.root)) {
            throw new Error(`Resource directory ${this.root} does not exist.`);
        }

        if(!fs.existsSync(this.sfx_folder)) {
            throw new Error(`${this.sfx_folder} does not exist.`);
        }
        log.debug(`SFX folder contains ${fs.readdirSync(this.sfx_folder).length} files.`);

        if(!fs.existsSync(this.img_folder)) {
            fs.mkdirSync(this.img_folder);
            
            throw new Error(`${this.img_folder} does not exist.`);
        }
        log.debug(`Image folder contains ${fs.readdirSync(this.img_folder).length} files.`);
        
        this.initialized = true;
    }

    private setRoot(dir: string) {
        this.root = dir;
        this.sfx_folder = path.join(this.root, 'sfx');
        this.img_folder = path.join(this.root, 'img');
    }

    getImages(): string[] {
        this.errorIfNotInitialized();
        return fs.readdirSync(this.img_folder);
    }

    getAllSFXExt(): string[] {
        this.errorIfNotInitialized();
        return fs.readdirSync(this.sfx_folder);
    }

    getAllSFX(): string[] {
        return this.getAllSFXExt().map(file => {
            return file.replace('.mp3', '');
        });
    }

    getSFXPath(name: string): string | undefined {
        this.errorIfNotInitialized();
        const sfxs = this.getAllSFXExt();

        for(let sfx of sfxs) {
            if(sfx === name || sfx.replace('.mp3', '') === name) {
                return path.join(this.sfx_folder, sfx);
            }
        }
    }

    getImagePath(name: string): string {
        this.errorIfNotInitialized();
        const imgs = this.getImages();

        for(let img of imgs) {
            if(img === name) {
                return path.join(this.img_folder, img);
            }
        }

        throw new Error(`File not found: ${name}`);
    }

    sfxExists(name: string): boolean {
        this.errorIfNotInitialized();
        return this.getSFXPath(name) !== undefined;
    }

    imageExists(name: string): boolean {
        this.errorIfNotInitialized();
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
        this.errorIfNotInitialized();

        if(!validator.isURL(link)) {
            throw new Error(`Provided link is not a valid URI: ${link}`);
        }

        if(path.extname(link) !== '.mp3' && path.extname(link) !== '.opus') {
            throw new Error(`File to download must have .mp3 or .opus extension: ${link}`);
        }

        if(path.extname(filename) !== '.mp3' && path.extname(link) !== '.opus') {
            throw new Error(`File must have .mp3 or .opus extension: ${filename}`);
        }

        if(this.sfxExists(filename)) {
            throw new Error(`File already exists with name: ${filename}`);
        }

        return new Promise((resolve, reject) => {
            axios.get(link, {
                responseType: 'stream'
            }).then((response) => {
                response.data.pipe(fs.createWriteStream(path.join(this.sfx_folder, filename)));
                resolve();
            }).catch(reject);
        });
    }

    async addSFX(filename: string, data: Buffer) {
        if(this.sfxExists(filename)) throw new Error('SFX already exists');
        fs.writeFileSync(path.join(this.sfx_folder, filename), data);
    }

    /**
     * 
     */
    removeSFX(name: string): void {
        this.errorIfNotInitialized();
        const sfx = this.getSFXPath(name);

        if(!sfx) {
            throw new Error(`SFX does not exist: ${name}`);
        }

        fs.removeSync(sfx);
    }

    private errorIfNotInitialized() {
        if(!this.initialized) {
            throw new Error('ResourceHandler must be initialized before use.');
        }
    }
}

export default new ResourceHandler();
