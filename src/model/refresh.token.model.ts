import { Column, Model, CreatedAt, Table, UpdatedAt } from "sequelize-typescript"

@Table
export class RefreshToken extends Model<RefreshToken>{

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true
        }
    })
    token!: string

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true
        }
    })
    refreshToken!: string

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date
}