import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { TokenRequest } from "../../../interface/request.interface";
import { ListService } from "../service/list.service";

const listService = new ListService()

export async function handleGetAllLists(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await listService.get()
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetAllListsFromElection(req: Request, res: Response, next: NextFunction) {
    try {
        const electionId = req.params.electionId
        const tokenRequest = req as TokenRequest

        const data = await listService.getFromElectionWithRole(tokenRequest.user, Number(electionId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleAddList(req: Request, res: Response, next: NextFunction) {
    try {
        const electionId = req.params.electionId
        const list = req.body
        const tokenRequest = req as TokenRequest

        const data = await listService.addWithRole(tokenRequest.user, Number(electionId), list)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetListById(req: Request, res: Response, next: NextFunction) {
    try {
        const electionId = req.params.electionId
        const listId = req.params.listId
        const tokenRequest = req as TokenRequest

        const data = await listService.getByIdWithRole(tokenRequest.user, Number(electionId), Number(listId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateListById(req: Request, res: Response, next: NextFunction) {
    try {
        const electionId = req.params.electionId
        const listId = req.params.listId
        const list = req.body
        const tokenRequest = req as TokenRequest

        const data = await listService.updateWithRole(tokenRequest.user, Number(electionId), Number(listId), list)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteListById(req: Request, res: Response, next: NextFunction) {
    try {
        const electionId = req.params.electionId
        const listId = req.params.listId
        const tokenRequest = req as TokenRequest

        const data = await listService.deleteWithRole(tokenRequest.user, Number(electionId), Number(listId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteAllLists(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await listService.deleteAll()
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}
