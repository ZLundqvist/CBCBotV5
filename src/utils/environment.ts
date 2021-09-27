export function isDevEnv(): boolean {
    return getNodeEnv() === 'development';
}

export function getNodeEnv(): string {
    return process.env['NODE_ENV'] === 'production' ? 'production' : 'development';
}

export function getEnv(key: string): string | undefined {
    return process.env[key];
}
