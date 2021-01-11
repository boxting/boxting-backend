import { InternalError } from "../../error/base.error"
import { NotPermittedError } from "../../error/not.permitted.error"
import { UserEvent } from "../../model/user.event.model"

export async function checkUserEventOwnership(eventId: number, userId:number) {
    try {
        const relation: UserEvent | null = await UserEvent.findOne({ where: { userId: userId, eventId: eventId } })

        if (relation == null || (!relation.isOwner && !relation.isCollaborator)) {
            return Promise.reject(new NotPermittedError(4003, "You can't modify a event that is not yours."))
        }

        return Promise.resolve(true)
    } catch (error) {
        return Promise.reject(new InternalError(500, error))
    }
}