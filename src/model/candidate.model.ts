import { BelongsTo, Column, Model, CreatedAt, ForeignKey, Table, UpdatedAt } from "sequelize-typescript"
import { Event } from "./event.model"
import { List } from "./list.model"

@Table
export class Candidate extends Model<Candidate>{

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            len: [1, 50]
        }
    })
    firstName!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            len: [1, 50]
        }
    })
    lastName!: string

    @Column({
        allowNull: false,
        unique: false,
        validate:{
            notEmpty:true,
            len:[3,500]
        }
    })
    information!: string

    @Column({
        allowNull: false,
        validate:{
            isNumeric:true,
            isInt:true
        }
    })
    age!: number

    @Column({
        allowNull: true,
        unique: false,
        validate:{
            notEmpty:true,
            len:[3,255]
        }
    })
    imageUrl!: string

    @Column({
        allowNull: true,
        defaultValue: true
    })
    isActive!: boolean

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @ForeignKey(() => List)
    @Column({
        allowNull: true,
        onDelete: "CASCADE"
    })
    listId!: number

    @Column({
        allowNull: false,
        validate: {
            isInt: true
        }
    })
    electionId!: number
}