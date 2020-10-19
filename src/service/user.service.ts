import { NotFoundError } from "../error/not.found.error";
import { InternalError } from "../error/base.error"
import { Result } from "../interface/result.interface";
import { Users as UserInterface} from "../interface/user.interface"
import { User } from "../model/user.model";
import { ValidationError, UniqueConstraintError } from "sequelize";
import { BadRequestError } from "../error/bad.request.error";
import { RoleEnum } from "../utils/role.enum";
import bcrypt from "bcrypt"

export class Users implements UserInterface{
    
    async get(): Promise<Result> {
        try {
            let users = await User.scope('full').findAll()
            return Promise.resolve({success: true, data: users})
        } catch (error) {
            return Promise.reject(new InternalError(error))
        }
    }
    
    async add(object: User): Promise<Result> {
        try {

            if(object.password != null){
                object.password = bcrypt.hashSync(object.password, 10)
            }else{
                return Promise.reject(new BadRequestError(`password cannot be null`))
            }

            object.roleId = RoleEnum.ADMIN
            let newUser = await User.create(object)

            return Promise.resolve({success: true, data: newUser})
        } catch (error) {
            let errorRes: Error

            if (error instanceof UniqueConstraintError){
                errorRes = new BadRequestError("Username is already registered")
            }else if(error instanceof ValidationError){
                let field = error.errors[0].path
                errorRes = new BadRequestError(`${field} cannot be null`)
            }
            else{
                errorRes = new InternalError(error)
            }

            return Promise.reject(errorRes)
        }
    }
    
    async deleteAll(): Promise<Result> {
        try {
            let deleted = await User.destroy()
            return Promise.resolve({success: true, data: `${deleted} objects deleted`})
        } catch (error) {
            return Promise.reject(new InternalError(error))
        }
    }
    
    async delete(id: string): Promise<Result> {
        try {
            await User.destroy({where:{ id: id }})
            return Promise.resolve({success: true, data: 'Object deleted'})
        } catch (error) {
            return Promise.reject(new InternalError(error))
        }
    }
    
    async getById(id: string): Promise<Result> {
        try {
            let user = await User.scope('full').findByPk(id)

            if (user == null){
                return Promise.reject(new NotFoundError("No user found with this id"))
            }

            return Promise.resolve({success: true, data: user})
        } catch (error) {
            return Promise.reject(new InternalError(error))
        }
    }
    
    async update(id: string, object: User): Promise<Result> {
        try {
            if(object.password != null){
                object.password = bcrypt.hashSync(object.password, 10)
            }

            let changes = await User.update(object, { where: { id: id } })

            return Promise.resolve({success: true, data: `User updated with ${changes} change(s)`})
        } catch (error) {
            console.log(error)
            return Promise.reject(new InternalError(error))
        }
    }

    async registerVoter(object: User): Promise<Result> {
        try {
                        
            if(object.voter == null){
                return Promise.reject(new BadRequestError("You must include a voter {} to register a voter"))
            }

            if(object.password != null){
                object.password = bcrypt.hashSync(object.password, 10)
            }else{
                return Promise.reject(new BadRequestError(`password cannot be null`))
            }

            object.roleId = RoleEnum.VOTER

            let newUser = await User.create(object, {
                include: [{
                    association: User.associations['voter']
                }]
            })

            return Promise.resolve({success: true, data: newUser})
        } catch (error) {
            let errorRes: Error

            if (error instanceof UniqueConstraintError){
                errorRes = new BadRequestError("Username is already registered")
            }else if(error instanceof ValidationError){
                let field = error.errors[0].path
                errorRes = new BadRequestError(`${field} cannot be null`)
            }
            else{
                errorRes = new InternalError(error)
            }

            return Promise.reject(errorRes)
        }
    }

    async registerOrganizer(object: User): Promise<Result> {
        try {
            
            if(object.organizer == null){
                return Promise.reject(new BadRequestError("You must include a organizer {} to register an organizer"))
            }

            if(object.password != null){
                object.password = bcrypt.hashSync(object.password, 10)
            }else{
                return Promise.reject(new BadRequestError(`password cannot be null`))
            }

            object.roleId = RoleEnum.ORGANIZER

            let newUser = await User.create(object, {
                include: [{
                    association: User.associations['organizer']
                }]
            })

            return Promise.resolve({success: true, data: newUser})
        } catch (error) {
            let errorRes: Error

            if (error instanceof UniqueConstraintError){
                errorRes = new BadRequestError("Username is already registered")
            }else if(error instanceof ValidationError){
                let field = error.errors[0].path
                errorRes = new BadRequestError(`${field} cannot be null`)
            }
            else{
                errorRes = new InternalError(error)
            }

            return Promise.reject(errorRes)
        }
    }

    async registerColaborator(object: User): Promise<Result> {
        try {

            if(object.password != null){
                object.password = bcrypt.hashSync(object.password, 10)
            }else{
                return Promise.reject(new BadRequestError(`password cannot be null`))
            }

            object.roleId = RoleEnum.COLLABORATOR

            let newUser = await User.create(object, {
                include: [{
                    association: User.associations['organizer']
                }]
            })

            return Promise.resolve({success: true, data: newUser})
        } catch (error) {
            let errorRes: Error

            if (error instanceof UniqueConstraintError){
                errorRes = new BadRequestError("Username is already registered")
            }else if(error instanceof ValidationError){
                let field = error.errors[0].path
                errorRes = new BadRequestError(`${field} cannot be null`)
            }
            else{
                errorRes = new InternalError(error)
            }

            return Promise.reject(errorRes)
        }
    }

    loginVoter(username: string, password: string): Promise<Result> {
        throw new Error("Method not implemented.");
    }

    loginOrganizer(username: string, password: string): Promise<Result> {
        throw new Error("Method not implemented.");
    }
    
}