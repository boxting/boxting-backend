export enum EventStatusEnum{
    NOT_STARTED = 1,
    IN_PROGRESS = 2,
    ENDED = 3,
    EDITION_CLOSED = 4
}

export function getEventStatus(startDate: Date, endDate:Date, configCompleted: boolean): EventStatusEnum {

    // Validate if event is in progress
    if (Date.now() >= startDate.getTime() && Date.now() <= endDate.getTime() ) {
        return EventStatusEnum.IN_PROGRESS
    }

    if (Date.now() > endDate.getTime()) {
        return EventStatusEnum.ENDED
    }

    if (configCompleted) {
        return EventStatusEnum.EDITION_CLOSED
    }

    if (Date.now() < startDate.getTime()) {
        return EventStatusEnum.NOT_STARTED
    }

    return EventStatusEnum.NOT_STARTED
}