import { BaseInterface } from "../../../interface/serivce.base.interface";
import { Result } from "../../../interface/result.interface";
import { Payload } from "../../../interface/request.interface";
import { Candidate } from "../model/candidate.model";

export interface CandidateInterface extends BaseInterface {
    getFromList(listId: number): Promise<Result>
    getFromElection(electionId: number): Promise<Result>
    getFromListWithRole(userPayload: Payload, listId: number): Promise<Result>
    getFromElectionWithRole(userPayload: Payload, electionId: number): Promise<Result>
    addWithRole(userPayload: Payload, listId: number, candidate: Candidate): Promise<Result>
    getByIdWithRole(userPayload: Payload, candidateId: number, listId: number): Promise<Result>
    getByIdFromElectionWithRole(userPayload: Payload, candidateId: number, electionId: number): Promise<Result>
    updateWithRole(userPayload: Payload, listId: number, candidateId: number, candidate: Candidate): Promise<Result>
    updateFromElectionWithRole(userPayload: Payload, electionId: number, candidateId: number, candidate: Candidate): Promise<Result>
    deleteWithRole(userPayload: Payload, listId: number, candidateId: number): Promise<Result>
    deleteFromElectionWithRole(userPayload: Payload, electionId: number, candidateId: number): Promise<Result>
}