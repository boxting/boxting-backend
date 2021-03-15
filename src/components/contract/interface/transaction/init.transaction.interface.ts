import { CandidateContract } from "../model/candidate.contract.interface";
import { ElectionContract } from "../model/election.contract.interface";
import { EventContract } from "../model/event.contract.interface";

export interface InitTransaction {
    event: EventContract
    elections: ElectionContract[]
    candidates: CandidateContract[]
}