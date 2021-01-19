import { BelongsTo, Column, Model, CreatedAt, ForeignKey, Table, UpdatedAt, HasMany } from "sequelize-typescript"
import { Election } from "./election.model"
import { Event } from "./event.model"
import { Candidate } from "./candidate.model"

@Table
export class List extends Model<List>{

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

    @Column({
        allowNull: true,
        unique: false,
        validate:{
            notEmpty:true,
            len:[3,255]
        }
    })
    imageUrl!: string

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @ForeignKey(() => Election)
    @Column({
        allowNull: false
    })
    electionId!: number

    @BelongsTo(() => Election)
    election?: Event

    @HasMany(() => Candidate)
    candidates? : Candidate[]
}