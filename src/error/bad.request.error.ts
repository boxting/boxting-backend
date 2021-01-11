export class BadRequestError extends Error{
    
    statusCode: number
    errorCode: number

    constructor(errorCode:number, message?: string){
        super();
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.message = message || "Bad Request"
        this.statusCode = 400
        this.errorCode = errorCode
    }
}