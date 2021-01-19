import { BaseInterface } from "./base.interface";
import { Result } from "../result.interface";

export interface ElectionInterface extends BaseInterface {
    getFromEvent(eventId: number): Promise<Result>
}