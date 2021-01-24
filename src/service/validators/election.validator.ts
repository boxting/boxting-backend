import { BadRequestError } from "../../error/bad.request.error"
import { NotFoundError } from "../../error/not.found.error"
import { InternalError } from "../../error/base.error"
import { Election } from "../../model/election.model"
import { NotPermittedError } from "../../error/not.permitted.error"
import { EventValidator } from "./event.validator"

export class ElectionValidator {

    public static async checkIfExistsAndStarted(electionId: number) {
        try {
            // Find election with specified id
            const election: Election | null = await Election.scope('event').findOne({ where: { id: electionId } })

            // Check if an election was found
            if (election == null) {
                return Promise.reject(new NotFoundError(6001, "There is no election with the inserted id."))
            }

            if (election.event!.startDate.getTime() <= Date.now()) {
                return Promise.reject(new BadRequestError(6003, "You can't modify a election that has already started."))
            }

            return Promise.resolve(election)
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkIfExists(electionId: number) {
        try {
            // Find election with specified id
            const election: Election | null = await Election.findOne({ where: { id: electionId } })

            // Check if an election was found
            if (election == null) {
                return Promise.reject(new NotFoundError(6001, "There is no election with the inserted id."))
            }

            return Promise.resolve(election)
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkUserOwnershipOrCollaboration(eventId: number, userId: number) {
        try {
            
            await EventValidator.checkUserOwnershipOrCollaboration(eventId, userId)

            return Promise.resolve(true)

        } catch (error) {
            // If request rejected with known error, update with election based error
            if (error.errorCode != undefined) {
                return Promise.reject(new NotPermittedError(6004, "You don't have permission to access this election."))
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkUserOwnership(eventId: number, userId: number) {
        try {
            
            await EventValidator.checkUserOwnership(eventId, userId)

            return Promise.resolve(true)

        } catch (error) {
            // If request rejected with known error, update with election based error
            if (error.errorCode != undefined) {
                return Promise.reject(new NotPermittedError(6005,  "You don't have enough permission to access this election."))
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkParticipation(eventId: number, userId: number) {
        try {
            
            await EventValidator.checkParticipation(eventId, userId)

            return Promise.resolve(true)

        } catch (error) {
            // If request rejected with known error, update with election based error
            if (error.errorCode != undefined) {
                return Promise.reject(new NotPermittedError(6004, "You don't have permission to access this election."))
            }

            return Promise.reject(new InternalError(500, error))
        }
    }
}

