import { Voter } from "../../model/voter.model";
import { Result } from "../result.interface";
import { BaseInterface } from "./base.interface";

export interface UserInterface extends BaseInterface {
    getUserByDniOrEmail(mail: string, dni: string): Promise<Voter | null>
    getAllEvents(userId: number): Promise<Result>
    updatePassword(userId: number, oldPassword: string, newPassword: string): Promise<Result>
}