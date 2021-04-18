export class UnauthorizedError extends Error {

    statusCode: number
    errorCode: number

    constructor(errorCode: number, message?: string) {
        super();
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.message = message || 'Invalid token in authorization header'
        this.statusCode = 401
        this.errorCode = errorCode
    }
}