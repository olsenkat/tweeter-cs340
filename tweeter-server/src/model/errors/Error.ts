export class BadRequestError extends Error {
    statusCode = 400;
    constructor(message: string) {
        super(message);
    }
}

export class UnauthorizedError extends Error {
    statusCode = 401;
    constructor(message: string) {
        super(message);
    }
}

export class InternalServerError extends Error {
    statusCode = 500;
    constructor(message: string) {
        super(message);
    }
}