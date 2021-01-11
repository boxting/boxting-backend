import { Result } from "../result.interface";

export interface AccessCodeInterface {
    addToEvent(codes: string[], eventId: number, userId: number): Promise<Result>
    updateOneOnEvent(codeId: number, eventId: number, newCode: string): Promise<Result>
    deleteOneOnEvent(codeId: number): Promise<Result>
    deleteAllNotUsedFromEvent(eventId: number): Promise<Result>
    getAllFromEvent(eventId: number): Promise<Result>
}