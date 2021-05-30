import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { TokenRequest } from "../../../interface/request.interface";
import { ElectionService } from "../service/election.service";

const electionService = new ElectionService()

export async function handleGetAllElections(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await electionService.get()
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetAllElectionsFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId
        const tokenRequest = req as TokenRequest

        const data = await electionService.getFromEventWithRole(tokenRequest.user, Number(eventId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleAddElection(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId
        const election = req.body
        const tokenRequest = req as TokenRequest

        const data = await electionService.addWithRole(tokenRequest.user, Number(eventId), election)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetElectionById(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId
        const electionId = req.params.electionId
        const tokenRequest = req as TokenRequest

        const data = await electionService.getByIdWithRole(tokenRequest.user, Number(eventId), Number(electionId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateElectionById(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId
        const electionId = req.params.electionId
        const election = req.body
        const tokenRequest = req as TokenRequest

        const data = await electionService.updateWithRole(tokenRequest.user, Number(eventId), Number(electionId), election)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteElectionById(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId
        const electionId = req.params.electionId
        const tokenRequest = req as TokenRequest

        const data = await electionService.deleteWithRole(tokenRequest.user, Number(eventId), Number(electionId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteAllElections(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await electionService.deleteAll()
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetElectionResults(req: Request, res: Response, next: NextFunction) {
    try {
        const electionId = req.params.electionId
        const tokenRequest = req as TokenRequest

        const data = await electionService.getElectionResults(tokenRequest.user, Number(electionId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleEmitVote(req: Request, res: Response, next: NextFunction) {
    try {
        const electionId = req.params.electionId
        const tokenRequest = req as TokenRequest
        const { candidates } = req.body
        
        const data = await electionService.emitVoteOnElection(tokenRequest.user, Number(electionId), candidates)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleReadVote(req: Request, res: Response, next: NextFunction) {
    try {
        const electionId = req.params.electionId
        const tokenRequest = req as TokenRequest

        const data = await electionService.getVote(tokenRequest.user, Number(electionId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}