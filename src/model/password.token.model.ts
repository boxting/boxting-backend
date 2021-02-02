import { BelongsTo, Column, Model, CreatedAt, ForeignKey, Table, UpdatedAt, HasMany, Scopes } from "sequelize-typescript"
import { User } from "./user.model"

@Table
export class PasswordToken extends Model<PasswordToken>{

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true
        }
    })
    token!: string

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @ForeignKey(() => User)
    @Column({
        allowNull: false
    })
    userId!: number

    @BelongsTo(() => User)
    user?: User
}