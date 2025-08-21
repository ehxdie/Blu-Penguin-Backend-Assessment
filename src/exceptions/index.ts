export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
}

export class BaseError extends Error {
    public readonly name: string;
    public readonly httpCode: HttpStatusCode;
    public readonly isOperational: boolean;

    constructor(
        name: string,
        httpCode: HttpStatusCode,
        description: string,
        isOperational: boolean,
    ) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this);
    }
}

export class InternalServerError extends BaseError {
    constructor(description: string = 'Internal Server Error') {
        super(
            "InternalServerError",
            HttpStatusCode.INTERNAL_SERVER,
            description,
            true,
        );
    }
}

export class BadRequestError extends BaseError {
    constructor(description: string = 'Bad Request') {
        super("BadRequestError", HttpStatusCode.BAD_REQUEST, description, true);
    }
}

export class NotFoundError extends BaseError {
    constructor(description: string = 'Not Found') {
        super("NotFoundError", HttpStatusCode.NOT_FOUND, description, true);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(description: string = 'Unauthorized') {
        super("UnauthorizedError", HttpStatusCode.UNAUTHORIZED, description, true);
    }
}

export class ForbiddenError extends BaseError {
    constructor(description: string = 'Forbidden') {
        super("ForbiddenError", HttpStatusCode.UNAUTHORIZED, description, true);
    }
}

export class NotImplementedError extends BaseError {
    constructor(description: string = 'Not Implemented') {
        super(
            "NotImplementedError",
            HttpStatusCode.NOT_IMPLEMENTED,
            description,
            true,
        );
    }
}

export class BadGatewayError extends BaseError {
    constructor(description: string = 'Bad Gateway') {
        super("BadGatewayError", HttpStatusCode.BAD_GATEWAY, description, true);
    }
}

export class ServiceUnavailableError extends BaseError {
    constructor(description: string = 'Service Unavailable') {
        super(
            "ServiceUnavailableError",
            HttpStatusCode.SERVICE_UNAVAILABLE,
            description,
            true,
        );
    }
}
