import { NextFunction, Request, Response } from "express"
import { InternalError } from "../error/base.error";

export function handleError(err: InternalError, req: Request, res: Response, next: NextFunction) {

    res.status(err.statusCode).send({ 'success': false, "error": err });
}