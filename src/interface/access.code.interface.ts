import { Result } from "./result.interface";

export interface AccessCode{
    addOnEvent(codes:[], eventId:number): Promise<Result>
    updateOnEvent(codes:[], eventId:number): Promise<Result>
    deleteAllFromEvent(eventId:number): Promise<Result>
    getAllFromEvent(eventId:number): Promise<Result>
}