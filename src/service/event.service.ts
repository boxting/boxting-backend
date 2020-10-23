import { ValidationError } from "sequelize/types";
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { NotFoundError } from "../error/not.found.error";
import { NotPermittedError } from "../error/not.permitted.error";
import { Events as EventsInterface } from "../interface/event.interface"
import { Result } from "../interface/result.interface";
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

            let user = await User.findByPk(userId)

            if(user == null){
                return Promise.reject(new NotFoundError(3001, "No user found with this id"))
            }

            if(user.roleId != RoleEnum.VOTER){
                return Promise.reject(new BadRequestError(4006, "The user you are trying to register is not a voter."))
            }

            let event = await Event.findOne({ where: { code: eventCode } })
            
            if(event == null){
                return Promise.reject(new NotFoundError(4007, "There is no event with the inserted code."))
            }

            //Temporary access code
            accessCode = "123456789"

            let res = await UserEvent.create({ userId: userId, eventId: event.id, accessCode: accessCode })

            return Promise.resolve({success: true, data: res})
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }

    async registerCollaborator(object: User, eventId: number): Promise<Result>{
        try {

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
            let events = await Event.scope('full').findAll()

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
            let objEvent:Event = new Event(object)
            objEvent.code = Math.random().toString(36).substr(2, 10)

            objEvent.validate()

            let user = await User.findByPk(userId)
            if(user == null){
                return Promise.reject(new NotFoundError(3001, "No user found with this id"))
            }

            if(user.roleId != RoleEnum.ORGANIZER){
                return Promise.reject(new BadRequestError(4009, "The user you are trying to register is not a organizer."))
            }

            let newEvent = await Event.create(object)
            await UserEvent.create({ userId: userId, eventId: newEvent.id, isOwner: true})
            
            return Promise.resolve({success: true, data: newEvent})
            
        } catch (error) {
            let errorRes: Error
            if(error instanceof ValidationError){
                let msg = error.errors[0].message
                errorRes = new BadRequestError(2003, msg)
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
                if( event.startDate.getTime() <= Date.now() ){
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
    
    async update(id: string, object: Event): Promise<Result> {

        try {
            const event: Event|null = await Event.findOne({ where: { id: id }})

            if(event == null){
                return Promise.reject(new NotFoundError(4001, "There is no event with the inserted id."))
            }

            if( event.startDate.getTime() <= Date.now() ){
                return Promise.reject(new BadRequestError(4002, "You can't modify a event that has already started."))
            }

            let startDate = object.startDate || event.startDate
            let endDate = object.endDate || event.endDate

            if( startDate.getTime() <= Date.now() ){
                return Promise.reject(new BadRequestError(4004, "The start date cannot be before current date."))
            }else if( startDate.getTime() >= endDate.getTime()){
                return Promise.reject(new BadRequestError(4005, "The end date cannot be before start date."))
            }

            //Make inmutable values be equal to orginial values
            object.id = event.id
            object.code = event.code
            
            let changes = await Event.update(object, { where: { id: id } })

            return Promise.resolve({success: true, data: `User updated with ${changes} change(s)`})
        } catch (error) {
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
