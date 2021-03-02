import { Result } from "../../../interface/result.interface";
import { BaseInterface } from "../../../interface/serivce.base.interface";

export interface UserInterface extends BaseInterface {
    getAllEvents(userId: number): Promise<Result>
    updatePassword(userId: number, oldPassword: string, newPassword: string): Promise<Result>
}