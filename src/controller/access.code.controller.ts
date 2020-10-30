import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { Payload, TokenRequest } from "../interface/request.interface";
import { AccessCodes } from "../service/access.code.service";

const accessCodes = new AccessCodes()

export async function handleCreateAccessCodesOnEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = req.params.eventId
        const {codes} = req.body
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.addOnEvent(codes, Number(event), userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetAccessCodesFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = req.params.eventId
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.getAllFromEvent(Number(event), userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteAllNotUsedFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = req.params.eventId
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.deleteAllNotUsedFromEvent(Number(event), userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteOneFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = req.params.eventId
        const code = req.params.codeId
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.deleteOneOnEvent(Number(code), Number(event), userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateOneFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = req.params.eventId
        const code = req.params.codeId
        const {newCode} = req.body
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.updateOneOnEvent(Number(code), Number(event), userId, newCode)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}