// Error
import { InternalError } from "../../../error/base.error";
import { NotFoundError } from "../../../error/not.found.error";
import { BadRequestError } from "../../../error/bad.request.error";
import { NotPermittedError } from "../../../error/not.permitted.error";
// Interface
import { Result } from '../../../interface/result.interface';
import { ElectionInterface } from '../interface/election.interface'
import { Payload } from '../../../interface/request.interface'
import { EmitVoteTransaction } from "../../contract/interface/transaction/emit.vote.interface";
// Model
import { Election } from '../model/election.model';
// Utils
import { clearData } from '../../../utils/clear.response';
import { RoleEnum } from "../../../utils/role.enum";
import { ContractManager } from "../../contract/util/cotract.manager";
import { CryptoManager } from "../../../utils/crypto.manager";
// Validators
import { EventValidator } from '../../event/validator/event.validator'
import { ElectionValidator } from "../validator/election.validator";
import { UserValidator } from "../../user/validator/user.validator";
import { CandidateValidator } from "../../candidate/validator/candidate.validator";
import { ReadVoteTransaction } from "../../contract/interface/transaction/read.vote.interface";
import { Event } from "../../event/model/event.model";
import { User } from "../../user/model/user.model";

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

            return Promise.resolve({ success: (deleted != 0), data: `Object${(deleted == 0) ? ' not' : ''} deleted` })
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
            const res = clearData(newElection)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getFromEvent(eventId: number) {
        try {
            // Check if event exists
            const event: Event = await EventValidator.checkIfExists(eventId)

            // Find all elections
            let elections = await Election.findAll({ where: { eventId: eventId } })

            // Remove null data
            const res = clearData(elections)

            const data = {
                eventStatus: event.eventStatus,
                elements: res
            }

            return Promise.resolve({ success: true, data })
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
            const event: Event = await EventValidator.checkIfExists(eventId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is subscribed to the event
                    await EventValidator.checkParticipation(eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
                }
            }

            // Get all the elections from Event
            const res = await this.getFromEvent(eventId)

            // Validate if user voted
            if (userPayload.role == RoleEnum.VOTER) {

                let elements = res.data.elements

                if (event.contract != undefined) {
                    // Get user with id
                    const user = await User.scope('full').findByPk(userPayload.id)

                    // Get the contract url
                    const cryptoManager = CryptoManager.getInstance()
                    const contractUrl = await cryptoManager.decrypt(event.contract)

                    // Send data to contract
                    const contractManager = ContractManager.getInstace()
                    const contractResponse = await contractManager.getVotedElections(contractUrl, user!.voter!.dni.toString())

                    // Get voted elections
                    const votedElections = contractResponse.data as string[]

                    for (let i = 0; i < elements.length; i++) {
                        const electionId = elements[i].id;

                        let index = votedElections.findIndex((value) => value.toString() == electionId.toString())

                        elements[i].userVoted = (index != -1)
                    }
                } else {
                    for (let i = 0; i < elements.length; i++) {
                        elements[i].userVoted = false
                    }
                }

                res.data.elements = elements
            }

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
            const event: Event = await EventValidator.checkIfExists(eventId)

            // If user is not admin, validate ownership or participation
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate if user is subscribed to the event
                    await EventValidator.checkParticipation(eventId, userPayload.id)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
                }
            }

            // Get election
            const res = await this.getById(electionId.toString())
            res.data.eventStatus = event.eventStatus

            // Validate if user voted
            if (userPayload.role == RoleEnum.VOTER) {

                res.data!.userVoted = false

                if (event.contract != undefined) {
                    // Get user with id
                    const user = await User.scope('full').findByPk(userPayload.id)

                    // Get the contract url
                    const cryptoManager = CryptoManager.getInstance()
                    const contractUrl = await cryptoManager.decrypt(event.contract)

                    // Send data to contract
                    const contractManager = ContractManager.getInstace()
                    const contractResponse = await contractManager.getVotedElections(contractUrl, user!.voter!.dni.toString())

                    // Get voted elections
                    const votedElections = contractResponse.data as string[]

                    let index = votedElections.findIndex((value) => value.toString() == electionId.toString())

                    if (index != -1) {
                        res.data!.userVoted = true
                    }
                }
            }

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

            // Update the election
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

            // Delete the election
            let res = await this.delete(electionId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getElectionResults(userPayload: Payload, electionId: number): Promise<Result> {
        try {
            // Check if election exist
            const election = await ElectionValidator.checkIfExists(electionId)

            // Get event
            const event = await EventValidator.checkIfExists(election.eventId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                if (userPayload.role == RoleEnum.VOTER) {
                    // Validate voter participation
                    await EventValidator.checkParticipation(event.id, userPayload.id)
                } else {
                    // Validate if user is owner of the event
                    await EventValidator.checkUserOwnershipOrCollaboration(event.id, userPayload.id)
                }
            }

            // Check if event was already initiated
            if (!event.configCompleted) {
                return Promise.reject(new BadRequestError(9018, 'The event has not been initiated.'))
            }

            // Check if contract url exist
            if (event.contract == undefined || event.contract == '') {
                return Promise.reject(new BadRequestError(9015, 'A contract conecction has not been set yet.'))
            }

            // Validate date only on voters
            const currentDate = Date.now()
            const endDate = event.endDate.getTime()

            if (userPayload.role == RoleEnum.VOTER && currentDate < endDate) {
                return Promise.reject(new NotPermittedError(10004, 'The event has not finished yet.'))
            }

            // Get the contract url
            const cryptoManager = CryptoManager.getInstance()
            const contractUrl = await cryptoManager.decrypt(event.contract)

            // Send data to contract
            const contractManager = ContractManager.getInstace()
            const res = await contractManager.getElectionResults(contractUrl, electionId.toString())

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getVote(userPayload: Payload, electionId: number): Promise<Result> {
        try {
            // Check if election exist
            const election = await ElectionValidator.checkIfExists(electionId)

            // Get user and validate if exist
            const voter = await UserValidator.checkIfExists(userPayload.id)

            // Get event
            const event = await EventValidator.checkIfExists(election.eventId)

            // Validate voter participation
            await EventValidator.checkParticipation(event.id, userPayload.id)

            // Check if event was already initiated
            if (!event.configCompleted) {
                return Promise.reject(new BadRequestError(9018, 'The event has not been initiated.'))
            }

            // Check if contract url exist
            if (event.contract == undefined || event.contract == '') {
                return Promise.reject(new BadRequestError(9015, 'A contract conecction has not been set yet.'))
            }

            // Validate date
            const currentDate = Date.now()
            const startDate = event.startDate.getTime()

            if (currentDate < startDate) {
                return Promise.resolve({ success: true, data: undefined })
            }

            const data: ReadVoteTransaction = {
                electionId: electionId.toString(),
                voter: {
                    firstName: voter.voter!.firstName,
                    lastName: voter.voter!.lastName,
                    id: voter.voter!.dni
                }
            }

            // Get the contract url
            const cryptoManager = CryptoManager.getInstance()
            const contractUrl = await cryptoManager.decrypt(event.contract)

            // Send data to contract
            const contractManager = ContractManager.getInstace()
            const res = await contractManager.readVote(contractUrl, data)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async emitVoteOnElection(userPayload: Payload, electionId: number, candidates: string[]): Promise<Result> {
        try {
            // Check if election exist
            const election = await ElectionValidator.checkIfExists(electionId)

            // Get user and validate if exist
            const voter = await UserValidator.checkIfExists(userPayload.id)

            // Get event
            const event = await EventValidator.checkIfExists(election.eventId)

            // Validate voter participation
            await EventValidator.checkParticipation(event.id, voter.id)

            // Check if event was already initiated
            if (!event.configCompleted) {
                return Promise.reject(new BadRequestError(9018, 'The event has not been initiated.'))
            }

            // Check if contract url exist
            if (event.contract == undefined || event.contract == '') {
                return Promise.reject(new BadRequestError(9015, 'A contract conecction has not been set yet.'))
            }

            // Validate date
            const currentDate = Date.now()
            const endDate = event.endDate.getTime()
            const startDate = event.startDate.getTime()

            if (currentDate < startDate || currentDate >= endDate) {
                return Promise.reject(new NotPermittedError(10008, 'The election is not open to votes yet.'))
            }
            console.log(candidates)
            console.log(election.winners)
            console.log(election.id)
            // Validate number of votes
            if (candidates == undefined || candidates.length != election.winners) {
                return Promise.reject(new BadRequestError(10010, 'The number of selected candidates is invalid.'))
            }
            
            // Validate selected candidates
            for (let i = 0; i < candidates.length; i++) {
                const candidateId = Number(candidates[i])
                await CandidateValidator.checkIfExistOnElection(candidateId, electionId)
            }

            // Create data
            const data: EmitVoteTransaction = {
                candidateIds: candidates,
                electionId: electionId.toString(),
                voter: {
                    firstName: voter.voter!.firstName,
                    lastName: voter.voter!.lastName,
                    id: voter.voter!.dni
                }
            }

            // Get the contract url
            const cryptoManager = CryptoManager.getInstance()
            const contractUrl = await cryptoManager.decrypt(event.contract)

            // Send data to contract
            const contractManager = ContractManager.getInstace()
            const res = await contractManager.emitVote(contractUrl, data)

            return Promise.resolve(res)
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }
}