import { CandidateContract } from "./candidate.contract.interface";

export interface VoteContract {
    id: string
    electionId: string
    voterId: string
    selectedCandidates: CandidateContract[] | string
    type: string
}