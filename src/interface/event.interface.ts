import { User } from "../model/user.model";
import { Base } from "./base.interface";
import { Result } from "./result.interface";

export interface Events extends Base{
    createEvent(object:Object, userId:number): Promise<Result>
    registerVoter(userId: number, eventId: number, accessCode: string): Promise<Result>
    registerCollaborator(object: Object, eventId: number): Promise<Result>
    registerOwner(userId: number, eventId: number): Promise<Result>
    deleteWithRole(id: string, role: number, userId:number): Promise<Result>
    getByIdWithRole(id: string, role: number, userId:number): Promise<Result>
}