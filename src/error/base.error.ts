export class InternalError extends Error{
    
    statusCode: number
    errorCode: number

    constructor(errorCode:number, message?: string, statusCode?: number){
        super();
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.message = message || "Internal Server Error"
        this.statusCode = statusCode || 500
        this.errorCode = errorCode
    }
}