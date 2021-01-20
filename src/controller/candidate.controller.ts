import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { TokenRequest } from "../interface/request.interface";
import { CandidateService } from "../service/candidate.service";

const candidateService = new CandidateService()

export async function handleGetAllCandidates(req: Request, res: Response, next: NextFunction){
    try {
        const data = await candidateService.get()
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetAllCandidatesFromElection(req: Request, res: Response, next: NextFunction){
    try {
        const electionId = req.params.electionId
        const tokenRequest = req as TokenRequest

        const data = await candidateService.getFromElectionWithRole(tokenRequest.user, Number(electionId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetAllCandidatesFromList(req: Request, res: Response, next: NextFunction){
    try {
        const listId = req.params.listId
        const tokenRequest = req as TokenRequest

        const data = await candidateService.getFromListWithRole(tokenRequest.user, Number(listId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleAddCandidate(req: Request, res: Response, next: NextFunction){
    try {
        const listId = req.params.listId
        const candidate = req.body
        const tokenRequest = req as TokenRequest

        const data = await candidateService.addWithRole(tokenRequest.user, Number(listId), candidate)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetCandidateById(req: Request, res: Response, next: NextFunction){
    try {
        const listId = req.params.listId
        const candidateId = req.params.candidateId
        const tokenRequest = req as TokenRequest

        const data = await candidateService.getByIdWithRole(tokenRequest.user, Number(listId), Number(candidateId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateCandidateById(req: Request, res: Response, next: NextFunction){
    try {
        const listId = req.params.listId
        const candidateId = req.params.candidateId
        const candidate = req.body
        const tokenRequest = req as TokenRequest

        const data = await candidateService.updateWithRole(tokenRequest.user, Number(listId), Number(candidateId), candidate)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteCandidateById(req: Request, res: Response, next: NextFunction){
    try {
        const listId = req.params.listId
        const candidateId = req.params.candidateId
        const tokenRequest = req as TokenRequest

        const data = await candidateService.deleteWithRole(tokenRequest.user, Number(listId), Number(candidateId))
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteAllCandidates(req: Request, res: Response, next: NextFunction){
    try {
        const data = await candidateService.deleteAll()
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}
