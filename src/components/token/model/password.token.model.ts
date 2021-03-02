import { BelongsTo, Column, Model, CreatedAt, ForeignKey, Table, UpdatedAt } from "sequelize-typescript"
import { User } from "../../user/model/user.model"

@Table
export class PasswordToken extends Model<PasswordToken>{

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true
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