// Error
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { NotFoundError } from "../error/not.found.error";
import { NotPermittedError } from "../error/not.permitted.error";
// Interface
import { Result } from '../interface/result.interface';
import { ElectionInterface } from '../interface/service/election.interface'
// Model
import { Election } from '../model/election.model';
// Utils
import { clearData } from '../utils/clear.response';

export class ElectionService implements ElectionInterface {

    async get(): Promise<Result> {
        try {
            // Find all elections
            let elections = await Election.findAll()

            // Remove null data
            const res = clearData(elections)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async add(election: Election): Promise<Result> {
        try {
            // Find all elections
            let elections = await Election.create(election)

            // Remove null data
            const res = clearData(elections)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteAll(): Promise<Result> {
        try {
            // Delete all elections
            let deleted = await Election.destroy({ where: {} })

            return Promise.resolve({ success: true, data: `${deleted} objects deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async delete(id: string): Promise<Result> {
        try {
            // Delete specific election by id
            let deleted = await Election.destroy({ where: { id: id } })

            return Promise.resolve({ success: true, data: `Object ${(deleted == 0) ? 'not' : ''} deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getById(id: string): Promise<Result> {
        try {
            // Find election
            const election = await Election.findByPk(id)

            if (election == null) {
                return Promise.reject(new NotFoundError(6001, 'No event found with provided id'))
            }

            // Remove null data
            const res = clearData(election)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async update(id: string, newElection: Election): Promise<Result> {
        try {
            // Find election
            const election = await Election.findByPk(id)

            // Check if election exists
            if (election == null) {
                return Promise.reject(new NotFoundError(6002, 'No event found with provided id'))
            }

            // Cannot update eventId
            newElection.eventId = election.eventId

            await Election.update(newElection, { where: { id: id } })

            // Remove null data
            const res = clearData(election)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

}