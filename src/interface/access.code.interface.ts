import { Result } from "./result.interface";

export interface AccessCode{
    addOnEvent(codes:string[], eventId:number, userId:number): Promise<Result>
    updateOneOnEvent(codeId: number, eventId:number, userId:number, newCode:string): Promise<Result>
    deleteOneOnEvent(codeId: number, eventId:number, userId:number): Promise<Result>
    deleteAllNotUsedFromEvent(eventId:number, userId:number): Promise<Result>
    getAllFromEvent(eventId:number, userId:number): Promise<Result>
}