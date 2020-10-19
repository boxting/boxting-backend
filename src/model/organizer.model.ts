import { Table, Model, Column, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"

@Table
export class Organizer extends Model<Organizer>{

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            isAlpha:true
        }
    })
    name!: string

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