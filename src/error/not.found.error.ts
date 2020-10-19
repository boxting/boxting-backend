import e from "express";

export class NotFoundError extends Error{
    
    statusCode: number

    constructor(message: string){
        super();
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.message = message || "Not found"
        this.statusCode = 404
    }
}