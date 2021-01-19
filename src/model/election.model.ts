import { BelongsTo, Column, Model, CreatedAt, ForeignKey, Table, UpdatedAt } from "sequelize-typescript"
import { Event } from "./event.model"

@Table
export class Election extends Model<Election>{

    @Column({
        allowNull: false,
        unique: false,
        validate:{
            notEmpty:true,
            len:[3,255]
        }
    })
    name!: string

    @Column({
        allowNull: false,
        unique: false,
        validate:{
            notEmpty:true,
            len:[3,255]
        }
    })
    information!: string

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @ForeignKey(() => Event)
    @Column({
        allowNull: false
    })
    eventId!: number

    @BelongsTo(() => Event)
    event?: Event
}