// Error
import { BadRequestError } from "../../../error/bad.request.error";
import { InternalError } from "../../../error/base.error";
import { NotPermittedError } from "../../../error/not.permitted.error";
// Interface
import { AccessCodeInterface } from "../interface/access.code.interface"
import { Result } from "../../../interface/result.interface";
// Model
import { AccessCode } from "../model/access.code.model";
import { UserEvent } from "../../event/model/user.event.model";

export class AccessCodeService implements AccessCodeInterface {

    async addToEvent(codes: string[], eventId: number, userId: number): Promise<Result> {

        try {
            const relation: UserEvent | null = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

            if (relation == null || (!relation.isOwner)) {
                return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
            }

            // Check all repetitions on sent codes
            let uniqueCodes = [...new Set(codes)]

            if (uniqueCodes.length != codes.length) {
                return Promise.reject(new BadRequestError(5001, "There's one or more duplicated codes on sent data."))
            }

            // Check repetitions on existing codes
            const accessCodes = await AccessCode.findAll({ where: { eventId: eventId } })
            let repeated = accessCodes.filter((val) => codes.indexOf(val.code) != -1)

            if (repeated.length > 0) {
                return Promise.reject(new BadRequestError(5002, "One or more of the inserted codes already exist for the event."))
            }

            // Convert each code in a new AccessCode object
            let newAccessCodes: Object[] = []
            codes.forEach((code) => {
                newAccessCodes.push({ code: code, eventId: eventId })
            })

            // Create all new access codes
            let res = await AccessCode.bulkCreate(newAccessCodes)

            return Promise.resolve({ success: true, data: res })

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async updateOneOnEvent(codeId: number, eventId: number, newCode: string): Promise<Result> {
        try {

            // Check if new code does not exist
            const existing = await AccessCode.findOne({ where: { eventId: eventId, code: newCode } })
            if (existing != null) {
                return Promise.reject(new BadRequestError(5002, "The inserted code already exist for the event."))
            }

            // Get access code with the specified id
            const accessCode = await AccessCode.findByPk(codeId)
            if (accessCode == null) {
                return Promise.reject(new BadRequestError(5003, "No code found with the specified id."))
            }

            // Check if access code was already used
            if (accessCode.used) {
                return Promise.reject(new BadRequestError(5004, "The code was already used."))
            }

            // Save updated access code
            accessCode.code = newCode
            const res = await accessCode.save()

            return Promise.resolve({ success: true, data: res })

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteOneOnEvent(codeId: number): Promise<Result> {
        try {

            // Find access code by id
            const accessCode = await AccessCode.findByPk(codeId)

            // Check if access code was found
            if (accessCode == null) {
                return Promise.reject(new BadRequestError(5003, "No code found with the specified id."))
            }

            // Check if code was already used
            if (accessCode.used) {
                return Promise.reject(new BadRequestError(5004, "The code was already used."))
            }

            // Delete access code
            await accessCode.destroy()

            return Promise.resolve({ success: true, data: 'Access code deleted for event' })

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async deleteAllNotUsedFromEvent(eventId: number): Promise<Result> {
        try {
            // Delete all not used on event
            const deleted = await AccessCode.destroy({ where: { used: false, eventId: eventId } })

            return Promise.resolve({ success: true, data: `${deleted} objects deleted` })

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getAllFromEvent(eventId: number): Promise<Result> {
        try {
            // Get all codes from event
            const accessCodes = await AccessCode.findAll({ where: { eventId: eventId } })

            return Promise.resolve({ success: true, data: accessCodes })

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }
}
