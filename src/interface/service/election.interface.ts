import { BaseInterface } from "./base.interface";
import { Result } from "../result.interface";
import { Payload } from "../request.interface";
import { Election } from "../../model/election.model";

export interface ElectionInterface extends BaseInterface {
    getFromEvent(eventId: number): Promise<Result>
    getFromEventWithRole(userPayload: Payload, eventId: number): Promise<Result>
    addWithRole(userPayload: Payload, eventId: number, election: Election): Promise<Result>
    getByIdWithRole(userPayload: Payload, eventId: number, electionId: number): Promise<Result>
    updateWithRole(userPayload: Payload, eventId: number, electionId: number, election: Election): Promise<Result>
    deleteWithRole(userPayload: Payload, eventId: number, electionId: number): Promise<Result>
}