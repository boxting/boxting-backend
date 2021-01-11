import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { Payload, TokenRequest } from "../interface/request.interface";
import { Event } from "../model/event.model";
import { EventService } from "../service/event.service";

const events = new EventService()

export async function handleGetAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await events.get()
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteEventWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        let id = req.params.id
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id
        const roleId = tokenRequest.user.role
        
        const data = await events.deleteWithRole(id, roleId, userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetEventById(req: Request, res: Response, next: NextFunction) {
    try {
        let id = req.params.id
        const data = await events.getById(id)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetEventByIdWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        let id = req.params.id
        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id
        const roleId = tokenRequest.user.role

        const data = await events.getByIdWithRole(id, roleId, userId)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateEvent(req: Request, res: Response, next: NextFunction) {
    try {
        let id = req.params.id
        let event:Event = req.body
        const data = await events.update(id, event)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateEventWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        let id = req.params.id
        let event:Event = req.body

        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id
        const roleId = tokenRequest.user.role

        const data = await events.updateWithRole(id, event, roleId, userId)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleCreateEvent(req: Request, res: Response, next: NextFunction) {
    try {
        let {organizerId, event} = req.body
        const data = await events.createEvent(event, organizerId)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleCreateEventWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        let event:Event = req.body

        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await events.createEvent(event, userId)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleSuscribeVoter(req: Request, res: Response, next: NextFunction) {
    try {
        let {userId, eventCode, accessCode} = req.body
        const data = await events.registerVoter(userId, eventCode, accessCode)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleSuscribeVoterWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        let {eventCode, accessCode} = req.body

        const tokenRequest = req as TokenRequest
        const userId = tokenRequest.user.id

        const data = await events.registerVoter(userId, eventCode, accessCode)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleAddCollaborator(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.id
        const user = req.body

        const tokenRequest = req as TokenRequest
        const roleId = tokenRequest.user.role
        const userId = tokenRequest.user.id

        const data = await events.registerCollaborator(user, Number(eventId), roleId, userId)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}