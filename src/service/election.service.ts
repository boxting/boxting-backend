// Error
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { NotFoundError } from "../error/not.found.error";
import { NotPermittedError } from "../error/not.permitted.error";
// Interface
import { Result } from '../interface/result.interface';
import { ElectionInterface } from '../interface/service/election.interface'
import { Payload } from '../interface/request.interface'
// Model
import { Election } from '../model/election.model';
// Utils
import { clearData } from '../utils/clear.response';
// Validators
import { EventValidator } from './validators/event.validator'
import { RoleEnum } from "../utils/role.enum";

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
            // Add election
            // Create method validates if the instance is correct before saving
            let createdElection = await Election.create(election)

            // Remove null data
            const res = clearData(createdElection)

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
                return Promise.reject(new NotFoundError(6001, 'No election found with provided id'))
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
                return Promise.reject(new NotFoundError(6002, 'No election found with provided id'))
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

    async getFromEvent(eventId: number) {
        try {
            // Check if event exists
            await EventValidator.checkIfExists(eventId)

            // Find all elections
            let elections = await Election.findAll({ where: { eventId: eventId } })

            // Remove null data
            const res = clearData(elections)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getFromEventWithRole(userPayload: Payload, eventId: number) {
        try {

            // Check if event exists
            await EventValidator.checkIfExists(eventId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is suscribed to the event
                    await EventValidator.checkParticipation(eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
                }
            }

            // Get all the elections from Event
            let res = await this.getFromEvent(eventId)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async addWithRole(userPayload: Payload, eventId: number, election: Election) {
        try {

            // Check if event exists and has not started yet
            await EventValidator.checkIfExistsAndStarted(eventId)

            // Add eventid to new election object
            election.eventId = eventId

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
            }

            // Create the election
            let res = await this.add(election)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getByIdWithRole(userPayload: Payload, eventId: number, electionId: number) {
        try {

            // Check if event exists
            await EventValidator.checkIfExists(eventId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is suscribed to the event
                    await EventValidator.checkParticipation(eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
                }
            }

            // Get all the elections from Event
            let res = await this.getById(electionId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateWithRole(userPayload: Payload, eventId: number, electionId: number, election: Election) {
        try {

            // Check if event exists and has not started yet
            await EventValidator.checkIfExistsAndStarted(eventId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
            }

            // Create the election
            let res = await this.update(electionId.toString(), election)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteWithRole(userPayload: Payload, eventId: number, electionId: number) {
        try {

            // Check if event exists
            await EventValidator.checkIfExistsAndStarted(eventId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner of the event
                await EventValidator.checkUserOwnership(eventId, userPayload.id)
            }

            // Get all the elections from Event
            let res = await this.delete(electionId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }
}