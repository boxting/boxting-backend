import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { Payload, TokenRequest } from "../interface/request.interface";
import { AccessCodeService } from "../service/access.code.service";
import { checkUserEventOwnershipOrCollaboration } from "../service/validators/event.validator";

const accessCodes = new AccessCodeService()

export async function handleCreateAccessCodesOnEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = Number(req.params.eventId)
        const { codes } = req.body
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.addToEvent(codes, event, userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetAccessCodesFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = Number(req.params.eventId)
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.getAllFromEvent(event)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteAllNotUsedFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = Number(req.params.eventId)
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await accessCodes.deleteAllNotUsedFromEvent(event)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteOneFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = Number(req.params.eventId)
        const codeId = Number(req.params.codeId)

        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        await checkUserEventOwnershipOrCollaboration(eventId, userId)

        const data = await accessCodes.deleteOneOnEvent(codeId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateOneFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = Number(req.params.eventId)
        const codeId = Number(req.params.codeId)

        const { newCode } = req.body
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        await checkUserEventOwnershipOrCollaboration(eventId, userId)

        const data = await accessCodes.updateOneOnEvent(codeId, eventId, newCode)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}