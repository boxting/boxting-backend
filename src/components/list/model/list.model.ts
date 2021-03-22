import { BelongsTo, Column, Model, CreatedAt, ForeignKey, Table, UpdatedAt, HasMany, Scopes } from "sequelize-typescript"
import { Election } from "../../election/model/election.model"
import { Candidate } from "../../candidate/model/candidate.model"

@Scopes(() => ({
    election: {
        attributes: ["id", "electionId"],
        include: [
            {
                model: Election,
                attributes: {
                    include: ["id", "eventId"]
                }
            }
        ]
    }
}))
@Table
export class List extends Model<List>{

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
        allowNull: true,
        unique: false,
        validate: {
            notEmpty: true,
            len: [3, 500]
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
    election?: Election

    @HasMany(() => Candidate)
    candidates?: Candidate[]
}