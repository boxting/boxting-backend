import { BaseInterface } from "./base.interface";
import { Result } from "../result.interface";
import { Payload } from "../request.interface";
import { List } from "../../model/list.model";

export interface ListInterface extends BaseInterface {
    getFromElection(electionId: number): Promise<Result>
    getFromElectionWithRole(userPayload: Payload, electionId: number): Promise<Result>
    addWithRole(userPayload: Payload, electionId: number, list: List): Promise<Result>
    getByIdWithRole(userPayload: Payload, electionId: number, listId: number): Promise<Result>
    updateWithRole(userPayload: Payload, electionId: number, listId: number, list: List): Promise<Result>
    deleteWithRole(userPayload: Payload, electionId: number, listId: number): Promise<Result>
}