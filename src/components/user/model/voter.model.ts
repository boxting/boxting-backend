import { Table, Model, Column, CreatedAt, UpdatedAt, ForeignKey } from "sequelize-typescript"
import { User } from "./user.model"

@Table
export class Voter extends Model<Voter>{

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 50]
        }
    })
    firstName!: string

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 50]
        }
    })
    lastName!: string

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true,
            isNumeric: true,
            len: [8, 10]
        },
        unique: true
    })
    dni!: string

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true,
            isNumeric: true,
            len: [9, 15]
        }
    })
    phone!: string

    @Column({
        allowNull: true,
        validate: {
            notEmpty: true,
            isNumeric: true
        }
    })
    age!: number

    @Column({
        allowNull: true,
        validate: {
            notEmpty: true,
            isDate: true
        }
    })
    birthday!: Date

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @ForeignKey(() => User)
    @Column({
        allowNull: true,
        onDelete: "CASCADE"
    })
    userId!: number
}