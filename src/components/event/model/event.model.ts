import { Table, Model, Column, CreatedAt, UpdatedAt, Scopes, BelongsToMany, HasMany } from "sequelize-typescript"
import { AccessCode } from "../../codes/model/access.code.model"
import { Organizer } from "../../user/model/organizer.model"
import { Role } from "../../role/model/role.model"
import { UserEvent } from "./user.event.model"
import { User } from "../../user/model/user.model"
import { Voter } from "../../user/model/voter.model"
import { Election } from "../../election/model/election.model"

@Scopes(() => ({
    voter: {
        include: [
            {
                model: User,
                through: {
                    attributes: [],
                    where: { isOwner: false, isCollaborator: false }
                },
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
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
                    }
                ],
            }
        ],
    },
    collaborator: {
        include: [
            {
                model: User,
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                },
                through: {
                    attributes: [],
                    where: { isOwner: false, isCollaborator: true }
                },
                include: [
                    {
                        model: Role,
                        attributes: ["name"]
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
    }
}))
@Table
export class Event extends Model<Event>{

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    })
    name!: string

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 1000]
        }
    })
    information!: string

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true,
            isDate: true
        }
    })
    startDate!: Date

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true,
            isDate: true
        }
    })
    endDate!: Date

    @Column({
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    })
    code!: string

    @Column({
        allowNull: true,
        unique: false,
        validate: {
            notEmpty: true
        }
    })
    contract!: string

    @Column({
        allowNull: true,
        unique: false,
        defaultValue: false
    })
    configCompleted!: boolean

    @CreatedAt
    createdAt!: Date

    @UpdatedAt
    updatedAt!: Date

    @BelongsToMany(() => User, () => UserEvent)
    users?: User[]

    @HasMany(() => AccessCode)
    accessCodes?: AccessCode[]

    @HasMany(() => Election)
    elections?: Election[]
}