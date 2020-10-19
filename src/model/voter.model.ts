import { Table, Model, Column, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"

@Table
export class Voter extends Model<Voter>{

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            isAlpha:true,
        }
    })
    firstName!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            isAlpha:true,
        }
    })
    lastName!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            isNumeric:true,
            len:[8, 9]
        }
    })
    dni!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            isEmail:true
        }
    })
    mail!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            isNumeric:true
        }
    })
    phone!: string

    @Column({
        allowNull: true,
        validate:{
            notEmpty:true,
            isNumeric:true
        }
    })
    age!: number

    @Column({
        allowNull: true,
        validate:{
            notEmpty:true,
            isDate:true
        }
    })
    birthday!: Date

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @ForeignKey(() => User)
    @Column({
        allowNull: true
    })
    userId!: number
}