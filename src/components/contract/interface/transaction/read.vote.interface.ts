import { VoterContract } from "../model/voter.contract.interface";

export interface ReadVoteTransaction {
    voter: VoterContract,
    electionId: string
}