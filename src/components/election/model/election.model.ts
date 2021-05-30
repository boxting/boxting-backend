import { BelongsTo, Column, Model, CreatedAt, ForeignKey, Table, UpdatedAt, HasMany, Scopes } from "sequelize-typescript"
import { Event } from "../../event/model/event.model"
import { List } from "../../list/model/list.model"
import { Type } from "../../type/model/type.model"

@Scopes(() => ({
    event: {
        attributes: {
            exclude: ["updatedAt", "createdAt"],
        },
        include: [
            {
                model: Event,
                attributes: {
                    exclude: ["updatedAt", "createdAt"],
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
            len: [3, 100]
        }
    })
    name!: string

    @Column({
        allowNull: false,
        unique: false,
        validate: {
            notEmpty: true,
            len: [3, 1000]
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