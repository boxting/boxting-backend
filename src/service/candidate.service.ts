// Error
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { NotFoundError } from "../error/not.found.error";
import { NotPermittedError } from "../error/not.permitted.error";
// Interface
import { Result } from '../interface/result.interface';
import { CandidateInterface } from '../interface/service/candidate.interface'
// Model
import { Candidate } from '../model/candidate.model';
// Utils
import { clearData } from '../utils/clear.response';

export class CandidateService implements CandidateInterface {

    async get(): Promise<Result> {
        try {
            // Find all candidates
            let candidates = await Candidate.findAll()

            // Remove null data
            const res = clearData(candidates)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async add(candidate: Candidate): Promise<Result> {
        try {
            // Find all candidates
            let candidates = await Candidate.create(candidate)

            // Remove null data
            const res = clearData(candidates)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteAll(): Promise<Result> {
        try {
            // Delete all candidates
            let deleted = await Candidate.destroy({ where: {} })

            return Promise.resolve({ success: true, data: `${deleted} objects deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async delete(id: string): Promise<Result> {
        try {
            // Delete specific candidate by id
            let deleted = await Candidate.destroy({ where: { id: id } })

            return Promise.resolve({ success: true, data: `Object ${(deleted == 0) ? 'not' : ''} deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getById(id: string): Promise<Result> {
        try {
            // Find candidate
            const candidate = await Candidate.findByPk(id)

            if (candidate == null) {
                return Promise.reject(new NotFoundError(8001, 'No candidate found with provided id'))
            }

            // Remove null data
            const res = clearData(candidate)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async update(id: string, newCandidate: Candidate): Promise<Result> {
        try {
            // Find candidate
            const candidate = await Candidate.findByPk(id)

            // Check if candidate exists
            if (candidate == null) {
                return Promise.reject(new NotFoundError(8002, 'No candidate found with provided id'))
            }

            // Cannot update ids
            newCandidate.listId = candidate.listId
            newCandidate.electionId = candidate.electionId

            await Candidate.update(newCandidate, { where: { id: id } })

            // Remove null data
            const res = clearData(candidate)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

}