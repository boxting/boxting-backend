export class BadRequestError extends Error{
    
    statusCode: number

    constructor(message: string){
        super();
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.message = message || "Bad Request"
        this.statusCode = 400
    }
}