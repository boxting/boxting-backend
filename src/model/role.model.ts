import { Table, Model, Column, CreatedAt, UpdatedAt, HasMany } from "sequelize-typescript"
import { User } from "./user.model"

@Table
export class Role extends Model<Role>{

    @Column({
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [1, 50]
        }
    })
    name!: string

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @HasMany(() => User)
    users?: User[]
}