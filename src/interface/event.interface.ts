import { User } from "../model/user.model";
import { Base } from "./base.interface";
import { Result } from "./result.interface";

export interface Events extends Base{
    registerUser(object: User): Promise<Result>
}