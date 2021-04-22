// Error
import { BadRequestError } from "../../../error/bad.request.error";
import { InternalError } from "../../../error/base.error";
import { NotFoundError } from "../../../error/not.found.error";
// Model
import { AccessCode } from "../../codes/model/access.code.model";
import { Event } from "../model/event.model";
import { UserEvent } from "../model/user.event.model";
import { User } from "../../user/model/user.model";
import { Election } from "../../election/model/election.model";
import { Candidate } from "../../candidate/model/candidate.model";
// Interface
import { EventInterface } from "../interface/event.interface"
import { Result } from "../../../interface/result.interface";
import { Payload } from "../../../interface/request.interface";
// Utils
import { clearData } from "../../../utils/clear.response";
import { RoleEnum } from "../../../utils/role.enum";
import { CryptoManager } from "../../../utils/crypto.manager";
import { TypeEnum } from "../../../utils/type.enum";
import { ContractManager } from "../../contract/util/cotract.manager"
// Service
import { LoginService } from "../../login/service/login.service";
// Packages
import { ValidationError } from "sequelize";
// Validators
import { EventValidator } from "../validator/event.validator"
import { UserValidator } from "../../user/validator/user.validator"
//Contract
import { CandidateContract } from "../../contract/interface/model/candidate.contract.interface";
import { ElectionContract } from "../../contract/interface/model/election.contract.interface";
import { InitTransaction } from "../../contract/interface/transaction/init.transaction.interface";


export class EventService implements EventInterface {

    private loginService: LoginService

    constructor() {
        this.loginService = new LoginService()
    }

    async get(): Promise<Result> {
        try {
            // Find all events
            let events = await Event.findAll()

            // Remove null data
            const res = clearData(events)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async add(event: Event): Promise<Result> {
        try {
            // Add event
            // Create method validates if the instance is correct before saving
            let createdEvent = await Event.create(event)

            // Remove null data
            const res = clearData(createdEvent)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteAll(): Promise<Result> {
        try {
            // Delete all events
            let deleted = await Event.destroy({ where: {} })

            return Promise.resolve({ success: true, data: `${deleted} objects deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async delete(id: string): Promise<Result> {
        try {
            // Delete specific event by id
            let deleted = await Event.destroy({ where: { id: id } })

            return Promise.resolve({ success: (deleted != 0), data: `Object${(deleted == 0) ? ' not' : ''} deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async update(id: string, newEvent: Event): Promise<Result> {
        try {
            // Find event
            const event = await EventValidator.checkIfExists(Number(id))

            // Cannot update some fields
            newEvent.contract = event.contract
            newEvent.code = event.code
            newEvent.configCompleted = event.configCompleted

            const changes = await Event.update(newEvent, { where: { id: id } })

            return Promise.resolve({ success: true, data: `Event updated with ${changes} change(s)` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getById(id: string): Promise<Result> {
        try {
            // Get the event with specified id
            let event = await Event.findByPk(id)

            // Check if result is null
            if (event == null) {
                return Promise.reject(new NotFoundError(4001, "No event found with this id"))
            }

            // Remove null data
            const res = clearData(event)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getAllUsers(id: string, scope: string): Promise<Result> {
        try {
            // Get the event with voter scope that will also get list of users with the scope
            let event = await Event.scope(scope).findByPk(id)

            // Return data (id existance has already been validated)
            return Promise.resolve({ success: true, data: event!.users })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getByIdWithRole(id: string, role: number, userId: number): Promise<Result> {
        try {
            // Check if event exists
            const event: Event = await EventValidator.checkIfExists(Number(id))

            // If user is not admin, validate ownership or participation
            if (role != RoleEnum.ADMIN) {
                if (role == RoleEnum.VOTER) {
                    // Validate if user is subscribed to the event
                    await EventValidator.checkParticipation(Number(id), userId)
                } else {
                    // Validate if user is owner or collaborator of the event
                    await EventValidator.checkUserOwnershipOrCollaboration(Number(id), userId)
                }
            }

            // Remove null data
            const res = clearData(event)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async addWithRole(event: Event, userId: number): Promise<Result> {
        try {
            // Generate random unique event code
            event.code = Math.random().toString(36).substr(2, 10)

            // Check if event is valid before creating
            let objEvent: Event = new Event(event)
            objEvent.validate()

            // Check if user exist
            const user = await UserValidator.checkIfExists(userId)

            // Validate role of user
            if (user.roleId != RoleEnum.ORGANIZER) {
                return Promise.reject(new BadRequestError(4010, "The user you are trying to register is not a organizer."))
            }

            // Validate inserted dates
            let startDate = objEvent.startDate.getTime()
            let endDate = objEvent.endDate.getTime()

            if (startDate <= Date.now()) {
                return Promise.reject(new BadRequestError(4004, "The start date cannot be before current date."))
            } else if (startDate >= endDate) {
                return Promise.reject(new BadRequestError(4005, "The end date cannot be before start date."))
            }

            // Create event
            let newEvent: Event = (await this.add(event)).data as Event

            // Create event relation with owner
            await UserEvent.create({ userId: userId, eventId: newEvent.id, isOwner: true })

            return Promise.resolve({ success: true, data: newEvent })
        } catch (error) {

            if (error instanceof ValidationError) {
                let msg = error.errors[0].message
                return Promise.reject(new BadRequestError(4009, msg))
            }

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteWithRole(id: string, role: number, userId: number): Promise<Result> {
        try {
            // Find event
            const event = await EventValidator.checkIfExists(Number(id))

            // Validate dates
            if (event.startDate.getTime() <= Date.now() && event.endDate.getTime() > Date.now()) {
                return Promise.reject(new BadRequestError(4016, "You can't delete a event that is in progress."))
            }

            // Check if an organizer is trying to delete the event, if not, it could only be an admin
            if (role == RoleEnum.ORGANIZER) {
                await EventValidator.checkUserOwnership(Number(id), userId)
            }

            // Delete the event
            await this.delete(id)

            return Promise.resolve({ success: true, data: 'Event deleted' })
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateWithRole(id: string, newEvent: Event, role: number, userId: number): Promise<Result> {
        try {

            const event = await EventValidator.checkIfExistsAndStarted(Number(id))

            // If user is not admin, validate ownership
            if (role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await EventValidator.checkUserOwnershipOrCollaboration(Number(id), userId)
            }

            // Validate dates
            let startDate = Date.parse(newEvent.startDate as unknown as string) || event.startDate.getTime()
            let endDate = Date.parse(newEvent.endDate as unknown as string) || event.endDate.getTime()

            if (startDate <= Date.now()) {
                return Promise.reject(new BadRequestError(4004, "The start date cannot be before current date."))
            } else if (startDate >= endDate) {
                return Promise.reject(new BadRequestError(4005, "The end date cannot be before start date."))
            }

            // Update event
            const res = await this.update(id, newEvent)

            return Promise.resolve(res)
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async registerVoter(userId: number, eventCode: number, accessCode: string): Promise<Result> {
        try {

            //Check if user exists
            let user = await UserValidator.checkIfExists(userId)

            //Check if is a voter
            if (user.roleId != RoleEnum.VOTER) {
                return Promise.reject(new BadRequestError(4006, "The user you are trying to register is not a voter."))
            }

            //Check if event exists
            let event = await Event.findOne({ where: { code: eventCode } })
            if (event == null) {
                return Promise.reject(new NotFoundError(4007, "There is no event with the inserted code."))
            }

            //Check if user is not already on event
            await EventValidator.checkIfUserIsAlreadySubscribed(Number(event.id!), userId)

            //Check if access code exists
            let existingCode = await AccessCode.findOne({ where: { eventId: event.id, code: accessCode } })

            if (existingCode == null || existingCode.used) {
                return Promise.reject(new BadRequestError(4008, "The access code is invalid for this event."))
            }

            // Change access code status
            existingCode.used = true
            existingCode.save()

            // Create voter event relation
            let res = await UserEvent.create({ userId: userId, eventId: event.id, accessCode: accessCode })

            return Promise.resolve({ success: true, data: res })
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }

    async unregisterUser(userId: number, eventId: number): Promise<Result> {
        try {

            // Check if event exists
            await EventValidator.checkIfExists(eventId)

            //Check if user exists
            await UserValidator.checkIfExists(userId)

            //Check if relation exists
            let userEventRelation = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

            if (userEventRelation == null) {
                return Promise.reject(new BadRequestError(4014, "The user is not subscribed to the specified event."))
            }

            await userEventRelation.destroy()

            return Promise.resolve({ success: true, data: 'User unsubscribed.' })
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async registerCollaborator(object: User, eventId: number, userPayload: Payload): Promise<Result> {
        try {

            // Check if event exists
            await EventValidator.checkIfExists(eventId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
            }

            // Register the collaborator as a user
            const res = await this.loginService.registerOrganizer(object, true)
            const collaborator = res.data as User

            // Create collaborator event relation
            await UserEvent.create({ userId: collaborator.id, eventId: eventId, isCollaborator: true })

            return Promise.resolve({ success: true, data: collaborator })
        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async registerCollaboratorByUsername(username: string, eventId: number, userPayload: Payload): Promise<Result> {
        try {

            // Check if event exists
            await EventValidator.checkIfExists(eventId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
            }

            // Check if a collaborator with the specified username exists
            const collaborator = await UserValidator.checkIfExistsByUsername(username)

            // Check if obtained user is collaborator
            if (collaborator.roleId != RoleEnum.COLLABORATOR) {
                return Promise.reject(new BadRequestError(4013, 'The inserted username is not a collaborator.'))
            }

            // Validate if user is already subscribed
            await EventValidator.checkIfUserIsAlreadySubscribed(eventId, collaborator.id)

            // Create collaborator event relation
            await UserEvent.create({ userId: collaborator.id, eventId: eventId, isCollaborator: true })

            const res = clearData(collaborator)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async getAllUsersWithRole(eventId: number, userPayload: Payload, scope: 'voter' | 'collaborator'): Promise<Result> {
        try {

            // Check if event exists
            await EventValidator.checkIfExists(eventId)

            // If user is not admin, validate ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                // Validate if user is owner or collaborator of the event
                await EventValidator.checkUserOwnershipOrCollaboration(eventId, userPayload.id)
            }

            // Get list of users with the specified scope
            let data = await this.getAllUsers(eventId.toString(), scope)

            // Return list of users
            return Promise.resolve({ success: true, data: data.data })
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateContract(eventId: number, contractUrl: string): Promise<Result> {
        try {
            // Check if event exists
            const event = await EventValidator.checkIfExists(eventId)

            // Get crypto manager
            const cryptoManager = CryptoManager.getInstance()

            // Encrypt contract url
            const encryptedContract = await cryptoManager.encrypt(contractUrl)

            // Update event
            event.contract = encryptedContract
            await event.save()

            return Promise.resolve({ success: true, data: 'New url saved.' })

        } catch (error) {
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }

    async initContract(eventId: number, userPayload: Payload): Promise<Result> {
        try {
            // Check if event exists
            const event = await EventValidator.checkIfExists(eventId)

            // If user is not an admin, check ownership
            if (userPayload.role != RoleEnum.ADMIN) {
                await EventValidator.checkUserOwnership(eventId, userPayload.id)
            }

            // Check if event was already initiated
            if (event.configCompleted) {
                return Promise.reject(new BadRequestError(10001, 'Contract has already been initited.'))
            }

            // Check if contract url exist
            if (event.contract == undefined || event.contract == '') {
                return Promise.reject(new BadRequestError(9015, 'A contract conecction has not been set yet.'))
            }

            // Get the elections
            const electionsList: Election[] = await Election.findAll({
                where: { eventId: eventId }
            })

            if (electionsList.length == 0) {
                return Promise.reject(new BadRequestError(9016, 'There has to be at least one election.'))
            }

            const elections: ElectionContract[] = []
            const candidates: CandidateContract[] = []

            for (let i = 0; i < electionsList.length; i++) {
                const election = electionsList[i];

                // push election
                elections.push({
                    electionType: (election.typeId == TypeEnum.SINGLE) ? 'single' : 'multiple',
                    eventId: election.eventId.toString(),
                    id: election.id.toString(),
                    maxVotes: election.winners,
                    name: election.name
                })

                // Get election candidates
                const candidatesList = await Candidate.findAll({
                    where: { electionId: election.id }
                })

                if (candidatesList.length < 2) {
                    return Promise.reject(new BadRequestError(9017, 'There has to be at least two candidates per election.'))
                }

                for (let j = 0; j < candidatesList.length; j++) {
                    const candidate = candidatesList[j];

                    // push candidate
                    candidates.push({
                        id: candidate.id.toString(),
                        electionId: candidate.electionId.toString(),
                        firstName: candidate.firstName,
                        imageUrl: candidate.imageUrl,
                        lastName: candidate.lastName
                    })
                }
            }

            // Create init transaction data
            const data: InitTransaction = {
                event: {
                    id: event.id,
                    endDate: event.endDate,
                    startDate: event.startDate
                },
                candidates: candidates,
                elections: elections
            }

            // Get the contract url
            const cryptoManager = CryptoManager.getInstance()
            const contractUrl = await cryptoManager.decrypt(event.contract)

            // Send data to contract
            const contractManager = ContractManager.getInstace()
            const res = await contractManager.initEvent(contractUrl, data)

            // Update event
            event.configCompleted = true
            await event.save()

            return Promise.resolve(res)
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }
}
