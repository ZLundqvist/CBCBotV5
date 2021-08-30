export class CommandError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}