export class CommandError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class ImportError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
