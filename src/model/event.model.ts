import { Table, Model, Column, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasOne, Scopes, NotNull, DefaultScope } from "sequelize-typescript"

@Scopes(() => ({
    
}))
@Table
export class User extends Model<User>{

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
}