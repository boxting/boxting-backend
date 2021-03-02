import { InternalError } from "../../../error/base.error"
import { NotFoundError } from "../../../error/not.found.error"
import { List } from "../model/list.model"
import { ElectionValidator } from "../../election/validator/election.validator"

export class ListValidator {

    public static async checkIfExistsAndStarted(listId: number) {
        try {
            // Find list with specified id
            const list: List | null = await List.scope('election').findOne({ where: { id: listId } })

            // Check if an list was found
            if (list == null) {
                return Promise.reject(new NotFoundError(7001, "There is no list with the inserted id."))
            }

            await ElectionValidator.checkIfExistsAndStarted(list.electionId)

            return Promise.resolve(list)
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkIfExists(listId: number) {
        try {
            // Find list with specified id
            const list: List | null = await List.scope('election').findOne({ where: { id: listId } })

            // Check if an list was found
            if (list == null) {
                return Promise.reject(new NotFoundError(7001, "There is no list with the inserted id."))
            }

            return Promise.resolve(list)
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }
}