import { Result } from "./result.interface";

export interface AccessCode{
    addOnEvent(codes:string[], eventId:number, userId:number): Promise<Result>
    updateOnEvent(codes:string[], eventId:number): Promise<Result>
    deleteAllFromEvent(eventId:number): Promise<Result>
    getAllFromEvent(eventId:number, userId:number): Promise<Result>
}