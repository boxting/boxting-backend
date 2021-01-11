import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { Payload, TokenRequest } from "../interface/request.interface";
import { User } from "../model/user.model";
import { UserService } from "../service/user.service";

const users = new UserService()

export async function handleGetAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await users.get()

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await users.deleteAll()

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteUserById(req: Request, res: Response, next: NextFunction) {
    try {
        let id = req.params.id

        const data = await users.delete(id)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetUserById(req: Request, res: Response, next: NextFunction) {
    try {
        let id = req.params.id

        const data = await users.getById(id)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateUser(req: Request, res: Response, next: NextFunction) {
    try {
        let id = req.params.id
        let user: User = req.body

        const data = await users.update(id, user)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetAllUserEventsWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenRequest = req as TokenRequest
        const id = tokenRequest.user.id

        const data = await users.getAllEvents(id)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteUserWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenRequest = req as TokenRequest
        const id = tokenRequest.user.id.toString()

        const data = await users.delete(id)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetUserWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenRequest = req as TokenRequest
        const id = tokenRequest.user.id.toString()

        const data = await users.getById(id)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateUserWithToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenRequest = req as TokenRequest

        const id = tokenRequest.user.id.toString()
        const user: User = req.body

        const data = await users.update(id, user)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}