import { ValidationError } from "sequelize";
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { NotFoundError } from "../error/not.found.error";
import { NotPermittedError } from "../error/not.permitted.error";
import { Events as EventsInterface } from "../interface/event.interface"
import { Result } from "../interface/result.interface";
import { AccessCode } from "../model/access.code.model";
import { Event } from "../model/event.model";
import { UserEvent } from "../model/user.event.model";
import { User } from "../model/user.model";
import { clearData } from "../utils/clear.response";
import { RoleEnum } from "../utils/role.enum";
import { Users as UserService } from "./user.service";

export class Events implements EventsInterface{

    private userService: UserService

    constructor(){
        this.userService = new UserService()
    }

    async registerVoter(userId: number, eventCode: number, accessCode: string): Promise<Result> {
        try {

            //Check if user exists
            let user = await User.findByPk(userId)
            if(user == null){
                return Promise.reject(new NotFoundError(3001, "No user found with this id"))
            }

            //Check if is a voter
            if(user.roleId != RoleEnum.VOTER){
                return Promise.reject(new BadRequestError(4006, "The user you are trying to register is not a voter."))
            }

            //Check if event exists
            let event = await Event.findOne({ where: { code: eventCode } })
            if(event == null){
                return Promise.reject(new NotFoundError(4007, "There is no event with the inserted code."))
            }

            //Check if access code exists
            let existingCode = await AccessCode.findOne({ where: { eventId: event.id, code: accessCode }})
            
            if(existingCode == null){
                return Promise.reject(new BadRequestError(4008, "The access code is invalid for this event."))
            }

            existingCode.used = true
            existingCode.save()

            let res = await UserEvent.create({ userId: userId, eventId: event.id, accessCode: accessCode })

            return Promise.resolve({success: true, data: res})
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }

    async registerCollaborator(object: User, eventId: number, role: number, userId:number): Promise<Result>{
        try {

            if( role == RoleEnum.ORGANIZER ){
                
                const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

                if( relation == null || !relation.isOwner ){
                    return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
                }
            }

            const collabCreation = await this.userService.registerCollaborator(object)
            const user = collabCreation.data as User

            let event = await Event.findByPk(eventId)
            
            if(event == null){
                return Promise.reject(new NotFoundError(4007, "There is no event with the inserted code."))
            }

            let res = await UserEvent.create({ userId: user.id, eventId: eventId, isCollaborator: true })

            return Promise.resolve({success: true, data: res})
        } catch (error) {

            let errorRes: Error

            if( error instanceof InternalError || error instanceof BadRequestError ){
                errorRes = error
            }else{
                errorRes = new InternalError(500, error)
            }

            return Promise.reject(errorRes)
        }
    }
    
    async get(): Promise<Result> {
        try {
            let events = await Event.findAll()

            //remove null data
            const res = clearData(events)

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async createEvent(object:Event, userId:number): Promise<Result>{
        try {

            //Check if event is valid before creating
            object.code = Math.random().toString(36).substr(2, 10)
            let objEvent:Event = new Event(object)
            objEvent.validate()

            let user = await User.findByPk(userId)
            if(user == null){
                return Promise.reject(new NotFoundError(3001, "No user found with this id"))
            }

            if(user.roleId != RoleEnum.ORGANIZER){
                return Promise.reject(new BadRequestError(4010, "The user you are trying to register is not a organizer."))
            }

            let startDate = objEvent.startDate.getTime()
            let endDate = objEvent.endDate.getTime()

            if( startDate <= Date.now() ){
                return Promise.reject(new BadRequestError(4004, "The start date cannot be before current date."))
            }else if( startDate >= endDate){
                return Promise.reject(new BadRequestError(4005, "The end date cannot be before start date."))
            }

            let newEvent = await Event.create(object)
            await UserEvent.create({ userId: userId, eventId: newEvent.id, isOwner: true})
            
            return Promise.resolve({success: true, data: newEvent})
            
        } catch (error) {
            let errorRes: Error
            if(error instanceof ValidationError){
                let msg = error.errors[0].message
                errorRes = new BadRequestError(4009, msg)
            }else{
                errorRes = new InternalError(500, error)
            }

            return Promise.reject(errorRes)
        }
    }
    
    async add(object: Object): Promise<Result> {
        throw new Error("Method not implemented.");
    }
    
    async deleteAll(): Promise<Result> {
        throw new Error("Method not implemented.");
    }

    async delete(id: string): Promise<Result> {
        throw new Error("Method not implemented.");
    }
    
    async deleteWithRole(id: string, role: number, userId:number): Promise<Result> {
        try {

            const event: Event|null = await Event.findOne({ where: { id: id }})

            if( event != null ){
                if( event.startDate.getTime() <= Date.now() && event.endDate.getTime() > Date.now()){
                    return Promise.reject(new BadRequestError(4002, "You can't delete a event that has already started."))
                }
            }else{
                return Promise.reject(new NotFoundError(4001, "There is no event with the inserted id."))
            }

            if( role == RoleEnum.ORGANIZER ){
                
                const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: id } })

                if( relation == null || !relation.isOwner ){
                    return Promise.reject(new NotPermittedError(4003, "You can't delete a event that is not yours."))
                }
            }

            await Event.destroy({where:{ id: id }})
            return Promise.resolve({success: true, data: 'Object deleted'})
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }
    
    async getById(id: string): Promise<Result> {
        try {         
            let event = await Event.scope('full').findByPk(id)

            if (event == null){
                return Promise.reject(new NotFoundError(4001, "No event found with this id"))
            }

            //remove null data
            const res = clearData(event)

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getByIdWithRole(id: string, role: number, userId: number): Promise<Result> {
        try {         
            let event: Event|null = null

            if(role == RoleEnum.VOTER){
                event = await Event.scope('voter').findByPk(id)
            }else if(role == RoleEnum.COLLABORATOR || role == RoleEnum.ORGANIZER){
                event = await Event.scope('full').findByPk(id)
            }

            if (event == null){
                return Promise.reject(new NotFoundError(4001, "No event found with this id"))
            }
 
            const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: id } })

            if( relation == null ){
                return Promise.reject(new NotPermittedError(4011, "You don't have access to this event."))
            }

            //remove null data
            const res = clearData(event)

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }
    
    async update(id: string, object: Event): Promise<Result> {

        try {
            const event: Event|null = await Event.findOne({ where: { id: id }})

            if(event == null){
                return Promise.reject(new NotFoundError(4001, "There is no event with the inserted id."))
            }

            if( event.startDate.getTime() <= Date.now() ){
                return Promise.reject(new BadRequestError(4002, "You can't modify a event that has already started."))
            }
            
            let startDate = Date.parse(object.startDate as unknown as string) || event.startDate.getTime()
            let endDate = Date.parse(object.endDate as unknown as string) || event.endDate.getTime()

            if( startDate <= Date.now() ){
                return Promise.reject(new BadRequestError(4004, "The start date cannot be before current date."))
            }else if( startDate >= endDate){
                return Promise.reject(new BadRequestError(4005, "The end date cannot be before start date."))
            }

            //Make inmutable values be equal to orginial values
            object.id = event.id
            object.code = event.code
            
            let changes = await Event.update(object, { where: { id: id } })

            return Promise.resolve({success: true, data: `Event updated with ${changes} change(s)`})
        } catch (error) {
            console.log(error)
            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateWithRole(id: string, object:Event, role: number, userId:number): Promise<Result>{
        try {
            
            if( role == RoleEnum.ORGANIZER || role == RoleEnum.COLLABORATOR){
                
                const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: id } })

                if( relation == null || (!relation.isOwner && !relation.isCollaborator) ){
                    return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
                }
            }

            const res = await this.update(id, object)

            return Promise.resolve(res)
        } catch (error) {

            let errorRes: Error

            if( error instanceof InternalError || error instanceof BadRequestError || error instanceof NotFoundError){
                errorRes = error
            }else{
                errorRes = new InternalError(500, error)
            }

            return Promise.reject(errorRes)
        }
    }
}
