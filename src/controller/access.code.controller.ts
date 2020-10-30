import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { Payload, TokenRequest } from "../interface/request.interface";
import { AccessCodes } from "../service/access.code.service";

const accessCodes = new AccessCodes()

export async function handleCreateAccessCodesOnEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const {event, codes} = req.body
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.addOnEvent(codes, event, userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetAccessCodesFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const {event, codes} = req.body
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.getAllFromEvent(event, userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}