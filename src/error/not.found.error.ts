export class NotFoundError extends Error{
    
    statusCode: number
    errorCode: number

    constructor(errorCode:number, message?: string){
        super();
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.message = message || "Not found"
        this.statusCode = 404
        this.errorCode = errorCode
    }
}