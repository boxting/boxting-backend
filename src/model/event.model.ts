import { Table, Model, Column, CreatedAt, UpdatedAt, Scopes, BelongsToMany } from "sequelize-typescript"
import { Organizer } from "./organizer.model"
import { Role } from "./role.model"
import { UserEvent } from "./user.event.model"
import { User } from "./user.model"
import { Voter } from "./voter.model"

@Scopes(() => ({
    full: {
        include: [
            {
                model: User,
                attributes: {
                    exclude: ["password"]
                },
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
        ],
    },
    voter: {

    }
}))
@Table
export class Event extends Model<Event>{

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            len:[3,100]
        }
    })
    name!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            len: [3, 500]
        }
    })
    information!: string

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            isDate:true
        }
    })
    startDate!: Date

    @Column({
        allowNull: false,
        validate:{
            notEmpty:true,
            isDate:true
        }
    })
    endDate!: Date

    @Column({
        allowNull: false,
        unique: true,
        validate:{
            notEmpty:true
        }
    })
    code!: String

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @BelongsToMany(() => User, () => UserEvent)
    users? : User[]
}