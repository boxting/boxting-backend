
import { BadRequestError } from "../error/bad.request.error";
import { InternalError } from "../error/base.error";
import { AccessCode as AccessCodeInterface } from "../interface/access.code.interface"
import { Result } from "../interface/result.interface";
import { AccessCode } from "../model/access.code.model";

export class AccessCodes implements AccessCodeInterface{

    async addOnEvent(codes:string[], eventId:number): Promise<Result>{

        try {

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
            let newAccessCodes : AccessCode[] = []
            codes.forEach( (code) =>{
                newAccessCodes.push(new AccessCode({ code: code, eventId: eventId }))
            })

            console.log(newAccessCodes)

            let res = await AccessCode.bulkCreate(newAccessCodes)

            return Promise.resolve({success: true, data: res})

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateOnEvent(codes:string[], eventId:number): Promise<Result>{
        throw new Error("Method not implemented.");
    }

    async deleteAllFromEvent(eventId: number): Promise<Result> {
        throw new Error("Method not implemented.");
    }

    async getAllFromEvent(eventId: number): Promise<Result> {
        throw new Error("Method not implemented.");
    }
}
