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
        allowNull: true,
        validate:{
            notEmpty:true
        }
    })
    accessCode?: string
}