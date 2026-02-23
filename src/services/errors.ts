export class AuthenticationError extends Error {
    status: number;

    constructor(message: string = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
        this.status = 401;
    }
}
