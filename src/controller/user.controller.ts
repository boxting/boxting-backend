import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { User } from "../model/user.model";
import { Users } from "../service/user.service";

const users = new Users()

export async function handleGetAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await users.get()
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRegisterAdmins(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await users.add(user)
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
        let user:User = req.body
        const data = await users.update(id, user)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRegisterVoters(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await users.registerVoter(user)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRegisterOrganizers(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await users.registerOrganizer(user)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRegisterCollaborators(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await users.registerCollaborator(user)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}