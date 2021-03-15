import { VoterContract } from "../model/voter.contract.interface";

export interface EmitVoteTransaction {
    voter: VoterContract,
    electionId: string,
    candidateIds: string[]
}