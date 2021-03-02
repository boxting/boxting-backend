import { Table, Model, ForeignKey, Column } from "sequelize-typescript";
import { User } from "../../user/model/user.model";
import { Event } from "./event.model";

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