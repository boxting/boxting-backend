import { Table, Model, ForeignKey, Column } from "sequelize-typescript";
import { Event } from "./event.model";
import { User } from "./user.model";

@Table
export class UserEvent extends Model<UserEvent>{

    @ForeignKey(() => User)
    @Column
    userId!: number

    @ForeignKey(() => Event)
    @Column
    eventId!: number

    @Column({
        allowNull: true
    })
    accessCode?: string

    @Column({
        allowNull: true,
        defaultValue: false
    })
    isOwner?: boolean

    @Column({
        allowNull: true,
        defaultValue: false
    })
    isCollaborator?: boolean
}