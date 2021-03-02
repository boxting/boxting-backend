import { BelongsTo, Column, Model, CreatedAt, ForeignKey, Table, UpdatedAt, HasMany, Scopes } from "sequelize-typescript"
import { Event } from "../../event/model/event.model"
import { List } from "../../list/model/list.model"
import { Type } from "../../type/model/type.model"

@Scopes(() => ({
    event: {
        attributes: ["id", "name", "eventId"],
        include: [
            {
                model: Event,
                attributes: {
                    include: ["id", "startDate", "endDate"],
                }
            }
        ]
    }
}))
@Table
export class Election extends Model<Election>{

    @Column({
        allowNull: false,
        unique: false,
        validate: {
            notEmpty: true,
            len: [3, 255]
        }
    })
    name!: string

    @Column({
        allowNull: false,
        unique: false,
        validate: {
            notEmpty: true,
            len: [3, 255]
        }
    })
    information!: string

    @Column({
        allowNull: false,
        unique: false,
        validate: {
            notEmpty: true,
            isInt: true
        }
    })
    winners!: number

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

    @ForeignKey(() => Type)
    @Column({
        allowNull: false
    })
    typeId!: number

    @BelongsTo(() => Type)
    type?: Type

    @HasMany(() => List)
    lists?: List[]
}