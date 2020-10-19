import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { Payload, TokenRequest } from "../interface/request.interface";
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
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRegisterOrganizers(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await users.registerOrganizer(user)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRegisterCollaborators(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await users.registerCollaborator(user)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const {username, password} = req.body
        const data = await users.loginAdmin(username, password)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleLoginVoter(req: Request, res: Response, next: NextFunction) {
    try {
        const {username, password} = req.body
        const data = await users.loginVoter(username, password)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleLoginOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
        const {username, password} = req.body
        const data = await users.loginOrganizer(username, password)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteUserByToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenRequest = req as TokenRequest
        const id = tokenRequest.user.id.toString()
        
        const data = await users.delete(id)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetUserByToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenRequest = req as TokenRequest
        const id = tokenRequest.user.id.toString()

        const data = await users.getById(id)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateUserByToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenRequest = req as TokenRequest

        const id = tokenRequest.user.id.toString()
        const user:User = req.body

        const data = await users.update(id, user)

        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}