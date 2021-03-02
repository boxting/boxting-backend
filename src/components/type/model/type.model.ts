import { Column, Model, CreatedAt, Table, UpdatedAt, HasMany } from "sequelize-typescript"
import { Election } from "../../election/model/election.model"

@Table
export class Type extends Model<Type>{

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

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @HasMany(() => Election)
    elections?: Election[]
}