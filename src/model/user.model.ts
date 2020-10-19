import { Table, Model, Column, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasOne } from "sequelize-typescript"
import { Organizer } from "./organizer.model"
import { Role } from "./role.model"
import { Voter } from "./voter.model"

@Table
export class User extends Model<User>{

    @Column({
        allowNull: false,
        unique: true,
        validate:{
            notEmpty:true,
            min: 5,
            max: 25
        }
    })
    username!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            min: 6
        }
    })
    password!: string

    @Column({
        allowNull: true
    })
    isActive!: string

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @ForeignKey(() => Role)
    @Column({
        allowNull: false
    })
    roleId!: number

    @BelongsTo(() => Role)
    role?: Role

    @HasOne(() => Voter)
    voter?: Voter
    
    @HasOne(() => Organizer)
    organizer?: Organizer
}