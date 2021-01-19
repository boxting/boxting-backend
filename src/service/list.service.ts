// Error
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { NotFoundError } from "../error/not.found.error";
import { NotPermittedError } from "../error/not.permitted.error";
// Interface
import { Result } from '../interface/result.interface';
import { ListInterface } from '../interface/service/list.interface'
// Model
import { List } from '../model/list.model';
// Utils
import { clearData } from '../utils/clear.response';

export class ListService implements ListInterface {

    async get(): Promise<Result> {
        try {
            // Find all lists
            let lists = await List.findAll()

            // Remove null data
            const res = clearData(lists)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async add(list: List): Promise<Result> {
        try {
            // Find all lists
            let lists = await List.create(list)

            // Remove null data
            const res = clearData(lists)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteAll(): Promise<Result> {
        try {
            // Delete all lists
            let deleted = await List.destroy({ where: {} })

            return Promise.resolve({ success: true, data: `${deleted} objects deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async delete(id: string): Promise<Result> {
        try {
            // Delete specific list by id
            let deleted = await List.destroy({ where: { id: id } })

            return Promise.resolve({ success: true, data: `Object ${(deleted == 0) ? 'not' : ''} deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getById(id: string): Promise<Result> {
        try {
            // Find list
            const list = await List.findByPk(id)

            if (list == null) {
                return Promise.reject(new NotFoundError(7001, 'No event found with provided id'))
            }

            // Remove null data
            const res = clearData(list)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async update(id: string, newList: List): Promise<Result> {
        try {
            // Find list
            const list = await List.findByPk(id)

            // Check if list exists
            if (list == null) {
                return Promise.reject(new NotFoundError(8002, 'No event found with provided id'))
            }

            // Cannot update eventId
            newList.electionId = list.electionId

            await List.update(newList, { where: { id: id } })

            // Remove null data
            const res = clearData(list)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

}