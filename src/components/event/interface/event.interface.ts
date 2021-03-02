import { BaseInterface } from "../../../interface/serivce.base.interface";
import { Result } from "../../../interface/result.interface";
import { Payload } from "../../../interface/request.interface";

export interface EventInterface extends BaseInterface {
    getAllUsers(id: string, scope: string): Promise<Result>
    createEvent(object: Object, userId: number): Promise<Result>
    registerVoter(userId: number, eventId: number, accessCode: string): Promise<Result>
    registerCollaborator(object: Object, eventId: number, userPayload: Payload): Promise<Result>
    registerCollaboratorByUsername(username: string, eventId: number, userPayload: Payload): Promise<Result>
    deleteWithRole(id: string, role: number, userId: number): Promise<Result>
    getByIdWithRole(id: string, role: number, userId: number): Promise<Result>
    updateWithRole(id: string, object: Object, role: number, userId: number): Promise<Result>
    getAllUsersWithRole(eventId: number, userPayload: Payload, scope: 'voter' | 'collaborator'): Promise<Result>
}