
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { NotPermittedError } from "../error/not.permitted.error";
import { AccessCode as AccessCodeInterface } from "../interface/access.code.interface"
import { Result } from "../interface/result.interface";
import { AccessCode } from "../model/access.code.model";
import { UserEvent } from "../model/user.event.model";

export class AccessCodes implements AccessCodeInterface{
    
    async addOnEvent(codes:string[], eventId:number, userId:number): Promise<Result>{

        try {

            const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

            if( relation == null || (!relation.isOwner) ){
                return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
            }

            //First check all repetitions on sent codes
            let uniqueCodes = [ ...new Set(codes)]

            if(uniqueCodes.length != codes.length){
               return Promise.reject(new BadRequestError(5001, "There's one or more duplicated codes on sent data."))
            }

            //Check repetitions on existing codes
            const accessCodes = await AccessCode.findAll({ where: { eventId: eventId }})
            let repeated = accessCodes.filter((val) => codes.indexOf(val.code) != -1)

            if(repeated.length > 0){
                return Promise.reject(new BadRequestError(5002, "One or more of the inserted codes already exist for the event."))
            }

            //Convert each code in a new AccessCode object
            let newAccessCodes : Object[] = []
            codes.forEach( (code) =>{
                newAccessCodes.push({ code: code, eventId: eventId })
            })

            console.log(newAccessCodes)

            let res = await AccessCode.bulkCreate(newAccessCodes)

            return Promise.resolve({success: true, data: res})

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateOneOnEvent(codeId: number, eventId: number, userId: number, newCode: string): Promise<Result> {
        try {

            const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

            if( relation == null || (!relation.isOwner && !relation.isCollaborator) ){
                return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
            }

            //Check if new code does not exist
            const existing = await AccessCode.findOne({ where: { eventId: eventId, code: newCode }})
            if(existing != null){
                return Promise.reject(new BadRequestError(5002, "The inserted code already exist for the event."))
            }

            //Get access code with the specified id
            const accessCode = await AccessCode.findByPk(codeId)
            if(accessCode == null){
                return Promise.reject(new BadRequestError(5003, "No code found with the specified id."))
            } else if( accessCode.used ){
                return Promise.reject(new BadRequestError(5004, "The code was already used."))
            }

            accessCode.code = newCode
            const res = await accessCode.save()

            return Promise.resolve({success: true, data: res})

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteOneOnEvent(codeId: number, eventId: number, userId: number): Promise<Result> {
        try {

            const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

            if( relation == null || (!relation.isOwner && !relation.isCollaborator) ){
                return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
            }

            const accessCode = await AccessCode.findByPk(codeId)

            if(accessCode == null){
                return Promise.reject(new BadRequestError(5003, "No code found with the specified id."))
            } else if( accessCode.used ){
                return Promise.reject(new BadRequestError(5004, "The code was already used."))
            }

            await accessCode.destroy()

            return Promise.resolve({success: true, data: 'Access code deleted for event'})

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteAllNotUsedFromEvent(eventId: number, userId:number): Promise<Result> {
        try {

            const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

            if( relation == null || (!relation.isOwner && !relation.isCollaborator) ){
                return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
            }

            const deleted = await AccessCode.destroy({ where:{ used: false, eventId: eventId }})

            return Promise.resolve({success: true, data: `${deleted} objects deleted`})

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getAllFromEvent(eventId: number, userId:number): Promise<Result> {
        try {

            const relation: UserEvent|null = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

            if( relation == null || (!relation.isOwner && !relation.isCollaborator) ){
                return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
            }

            const accessCodes = await AccessCode.findAll( { where: { eventId: eventId } } )

            return Promise.resolve({success: true, data: accessCodes})

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }
}
