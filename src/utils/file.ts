import assert from 'assert';
import { lstatSync, readdirSync } from 'fs';
import { isAbsolute, join } from 'path';

export function isDirectory(path: string): boolean {
    return lstatSync(path).isDirectory();
}

export function isFile(path: string): boolean {
    return lstatSync(path).isFile();
}

/**
 * Returns absolute paths to all files that exist in the given path
 */
export function getFiles(path: string): string[] {
    assert(isAbsolute(path) && isDirectory(path), `Invalid directory: ${path} (must be absolute path and directory)`);

    return readdirSync(path).map(name => {
        return join(path, name);
    }).filter(fullPath => {
        return isFile(fullPath);
    });
}

/**
 * Returns absolute paths to all directories that exist in the given path
 */
export function getDirectories(path: string): string[] {
    assert(isAbsolute(path) && isDirectory(path), `Invalid directory: ${path} (must be absolute path and directory)`);

    return readdirSync(path).map(name => {
        return join(path, name);
    }).filter(fullPath => {
        return isDirectory(fullPath);
    });
}

/**
 * Get the absolute paths to all files that exists in dirPath or sub-directories of dirPath
 */
export function getFilesRecursive(path: string): string[] {
    assert(isAbsolute(path) && isDirectory(path), `Invalid directory: ${path} (must be absolute path and directory)`);

    const walkDirectoriesRecursive = (dirPath: string, pathArray: string[]) => {
        const files = getFiles(dirPath);
        pathArray.push(...files);

        const directories = getDirectories(dirPath);
        for (const directory of directories) {
            walkDirectoriesRecursive(directory, pathArray);
        }
    };

    const filePaths: string[] = [];
    walkDirectoriesRecursive(path, filePaths);
    return filePaths;
}
