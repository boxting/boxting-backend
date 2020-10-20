export class NotPermittedError extends Error{
    
    statusCode: number
    errorCode: number

    constructor(errorCode:number, message?: string){
        super();
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.message = message || "You do not have the permission to get this data."
        this.statusCode = 403
        this.errorCode = errorCode
    }
}