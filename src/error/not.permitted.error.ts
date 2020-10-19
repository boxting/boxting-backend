export class NotPermittedError extends Error{
    
    statusCode: number

    constructor(message?: string){
        super();
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.message = message || "You do not have the permission to get this data."
        this.statusCode = 403
    }
}