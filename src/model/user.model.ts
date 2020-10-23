import { Table, Model, Column, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasOne, Scopes, BelongsToMany } from "sequelize-typescript"
import { Event } from "./event.model"
import { Organizer } from "./organizer.model"
import { Role } from "./role.model"
import { UserEvent } from "./user.event.model"
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
            len:[3,50]
        }
    })
    username!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            len: [6, 50]
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

    @BelongsToMany(() => Event, () => UserEvent)
    events? : Event[]
}