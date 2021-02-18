// Error
import { InternalError } from "../error/base.error";
import { NotFoundError } from "../error/not.found.error";
import { Payload } from "../interface/request.interface";
// Interface
import { Result } from '../interface/result.interface';
import { CandidateInterface } from '../interface/service/candidate.interface'
// Model
import { Candidate } from '../model/candidate.model';
// Utils
import { clearData } from '../utils/clear.response';
import { RoleEnum } from "../utils/role.enum";
// Validators
import { ElectionValidator } from "./validators/election.validator";
import { ListValidator } from "./validators/list.validator";

export class CandidateService implements CandidateInterface {

    async get(): Promise<Result> {
        try {
            // Find all candidates
            let candidates = await Candidate.scope('list').findAll()

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

            return Promise.resolve({ success: (deleted != 0), data: `Object${(deleted == 0) ? ' not' : ''} deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getById(id: string): Promise<Result> {
        try {
            // Find candidate
            const candidate = await Candidate.scope('list').findByPk(id)

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
            //newCandidate.listId = candidate.listId
            newCandidate.electionId = candidate.electionId

            await Candidate.update(newCandidate, { where: { id: id } })

            // Remove null data
            const res = clearData(newCandidate)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getFromList(listId: number) {
        try {
            // Check if list exists
            await ListValidator.checkIfExists(listId)

            // Find all candidates
            let candidates = await Candidate.scope('list').findAll({ where: { listId: listId } })

            // Remove null data
            const res = clearData(candidates)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getFromElection(electionId: number) {
        try {
            // Check if election exists
            await ElectionValidator.checkIfExists(electionId)

            // Find all candidates
            let candidates = await Candidate.scope('list').findAll({ where: { electionId: electionId } })

            // Remove null data
            const res = clearData(candidates)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getFromListWithRole(userPayload: Payload, listId: number) {
        try {

            // Check if list exists
            const list = await ListValidator.checkIfExists(listId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is subscribed to the event
                    await ElectionValidator.checkParticipation(list.election!.eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await ElectionValidator.checkUserOwnershipOrCollaboration(list.election!.eventId, userPayload.id)
                }
            }

            // Get all the candidates from List
            let res = await this.getFromList(listId)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getFromElectionWithRole(userPayload: Payload, electionId: number) {
        try {

            // Check if election exists
            const election = await ElectionValidator.checkIfExists(electionId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is subscribed to the event
                    await ElectionValidator.checkParticipation(election.eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await ElectionValidator.checkUserOwnershipOrCollaboration(election.eventId, userPayload.id)
                }
            }

            // Get all the candidates from Election
            let res = await this.getFromElection(electionId)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async addWithRole(userPayload: Payload, listId: number, candidate: Candidate) {
        try {

            // Check if list exists and event has not started yet
            const list = await ListValidator.checkIfExistsAndStarted(listId)

            // Add static ids to new candidate object
            candidate.electionId = list.electionId
            candidate.listId = listId

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await ElectionValidator.checkUserOwnershipOrCollaboration(list.election!.eventId, userPayload.id)
            }

            // Create the candidate
            let res = await this.add(candidate)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getByIdWithRole(userPayload: Payload, candidateId: number, listId: number) {
        try {

            // Check if list exists
            const list = await ListValidator.checkIfExists(listId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is subscribed to the event
                    await ElectionValidator.checkParticipation(list.election!.eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await ElectionValidator.checkUserOwnershipOrCollaboration(list.election!.eventId, userPayload.id)
                }
            }

            // Get candidate
            let res = await this.getById(candidateId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getByIdFromElectionWithRole(userPayload: Payload, candidateId: number, electionId: number): Promise<Result> {
        try {

            // Check if election exists
            const election = await ElectionValidator.checkIfExists(electionId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is subscribed to the event
                    await ElectionValidator.checkParticipation(election.eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await ElectionValidator.checkUserOwnershipOrCollaboration(election.eventId, userPayload.id)
                }
            }

            // Get candidate
            let res = await this.getById(candidateId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateWithRole(userPayload: Payload, listId: number, candidateId: number, candidate: Candidate) {
        try {

            // Check if list exists and has not started yet
            const list = await ListValidator.checkIfExistsAndStarted(listId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await ElectionValidator.checkUserOwnershipOrCollaboration(list.election!.eventId, userPayload.id)
            }

            // Update the candidate
            let res = await this.update(candidateId.toString(), candidate)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateFromElectionWithRole(userPayload: Payload, electionId: number,
        candidateId: number, candidate: Candidate): Promise<Result> {
        try {

            // Check if election exists and has not started yet
            const election = await ElectionValidator.checkIfExistsAndStarted(electionId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await ElectionValidator.checkUserOwnershipOrCollaboration(election.eventId, userPayload.id)
            }

            // Update the candidate
            let res = await this.update(candidateId.toString(), candidate)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }


    async deleteWithRole(userPayload: Payload, listId: number, candidateId: number) {
        try {

            // Check if list exists and has not started yet
            const list = await ListValidator.checkIfExistsAndStarted(listId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner of the event
                await ElectionValidator.checkUserOwnership(list.election!.eventId, userPayload.id)
            }

            // Delete the candidate
            let res = await this.delete(candidateId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteFromElectionWithRole(userPayload: Payload, electionId: number, candidateId: number): Promise<Result>{
        try {

            // Check if election exists and has not started yet
            const election = await ElectionValidator.checkIfExistsAndStarted(electionId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner of the event
                await ElectionValidator.checkUserOwnership(election.eventId, userPayload.id)
            }

            // Delete the candidate
            let res = await this.delete(candidateId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

}