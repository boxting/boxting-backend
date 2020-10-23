import { Table, Model, Column, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasOne, Scopes, NotNull, DefaultScope } from "sequelize-typescript"
import { Organizer } from "./organizer.model"
import { Role } from "./role.model"
import { Voter } from "./voter.model"

@Scopes(() => ({
    full: {
        attributes: ["id", "username", "isActive"],
        include: [
            {
                model: Role,
                attributes: ["name"]
            },
            {
                model: Voter,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "userId"],
                }
            },
            {
                model: Organizer,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "userId"],
                }
            }
        ],
    },
    login:{
        attributes: ["id", "username", "password", "roleId"],
        include: [
            {
                model: Role,
                attributes: ["name"]
            },
            {
                model: Voter,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "userId"],
                }
            },
            {
                model: Organizer,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "userId"],
                }
            }
        ],
    }
}))
@Table
export class User extends Model<User>{

    @Column({
        allowNull: false,
        unique: true,
        validate:{
            notEmpty:true,
            len:[3,25]
        }
    })
    username!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
        }
    })
    password!: string

    @Column({
        allowNull: true,
        defaultValue: true
    })
    isActive!: boolean

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

    @HasOne(() => Voter, {
        onDelete: "CASCADE"
    })
    voter?: Voter
    
    @HasOne(() => Organizer, {
        onDelete: "CASCADE"
    })
    organizer?: Organizer
}