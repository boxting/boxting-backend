// Error
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { NotFoundError } from "../error/not.found.error";
import { NotPermittedError } from "../error/not.permitted.error";
import { Payload } from "../interface/request.interface";
// Interface
import { Result } from '../interface/result.interface';
import { ListInterface } from '../interface/service/list.interface'
// Model
import { List } from '../model/list.model';
// Utils
import { clearData } from '../utils/clear.response';
import { RoleEnum } from "../utils/role.enum";
import { ElectionValidator } from "./validators/election.validator";

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

            return Promise.resolve({ success: (deleted != 0), data: `Object${(deleted == 0) ? ' not' : ''} deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getById(id: string): Promise<Result> {
        try {
            // Find list
            const list = await List.findByPk(id)

            if (list == null) {
                return Promise.reject(new NotFoundError(7001, 'No list found with provided id'))
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
                return Promise.reject(new NotFoundError(8002, 'No list found with provided id'))
            }

            // Cannot update electionId
            newList.electionId = list.electionId

            await List.update(newList, { where: { id: id } })

            // Remove null data
            const res = clearData(newList)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getFromElection(electionId: number) {
        try {
            // Check if election exists
            await ElectionValidator.checkIfExists(electionId)

            // Find all lists
            let lists = await List.findAll({ where: { electionId: electionId } })

            // Remove null data
            const res = clearData(lists)

            return Promise.resolve({ success: true, data: res })
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
                    // Validate if user is suscribed to the election
                    await ElectionValidator.checkParticipation(election.eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the election
                    await ElectionValidator.checkUserOwnershipOrCollaboration(election.eventId, userPayload.id)
                }
            }

            // Get all the lists from Election
            let res = await this.getFromElection(electionId)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async addWithRole(userPayload: Payload, electionId: number, list: List) {
        try {

            // Check if election exists and has not started yet
            const election = await ElectionValidator.checkIfExistsAndStarted(electionId)

            // Add electionId to new list object
            list.electionId = electionId

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the election
                await ElectionValidator.checkUserOwnershipOrCollaboration(election.event?.id, userPayload.id)
            }

            // Create the list
            let res = await this.add(list)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getByIdWithRole(userPayload: Payload, electionId: number, listId: number) {
        try {

            // Check if election exists
            const election = await ElectionValidator.checkIfExists(electionId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is suscribed to the election
                    await ElectionValidator.checkParticipation(election.eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the election
                    await ElectionValidator.checkUserOwnershipOrCollaboration(election.eventId, userPayload.id)
                }
            }

            // Get list
            let res = await this.getById(listId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateWithRole(userPayload: Payload, electionId: number, listId: number, list: List) {
        try {

            // Check if election exists and has not started yet
            const election = await ElectionValidator.checkIfExistsAndStarted(electionId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the election
                await ElectionValidator.checkUserOwnershipOrCollaboration(election.event?.id, userPayload.id)
            }

            // Update the List
            let res = await this.update(listId.toString(), list)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteWithRole(userPayload: Payload, electionId: number, listId: number) {
        try {

            // Check if election exists
            const election = await ElectionValidator.checkIfExistsAndStarted(electionId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner of the election
                await ElectionValidator.checkUserOwnership(election.event?.id, userPayload.id)
            }

            // Delete list
            let res = await this.delete(listId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }
}