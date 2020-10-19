import { NotFoundError } from "../error/not.found.error";
import { InternalError } from "../error/base.error"
import { Result } from "../interface/result.interface";
import { Users as UserInterface} from "../interface/user.interface"
import { User } from "../model/user.model";
import { ValidationError, UniqueConstraintError, Op } from "sequelize";
import { BadRequestError } from "../error/bad.request.error";
import { RoleEnum } from "../utils/role.enum";
import bcrypt from "bcrypt"
import { Voter } from "../model/voter.model";
import { Organizer } from "../model/organizer.model";
import { clearData } from "../utils/clear.response";
import { NotPermittedError } from "../error/not.permitted.error";
import { createToken } from "../utils/create.token";

export class Users implements UserInterface{
    
    async get(): Promise<Result> {
        try {
            let users = await User.scope('full').findAll()

            //remove null data
            const res = clearData(users)

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            return Promise.reject(new InternalError(error))
        }
    }
    
    async add(object: User): Promise<Result> {
        throw("Not implemented")
    }
    
    async deleteAll(): Promise<Result> {
        try {
            let deleted = await User.destroy({where:{}})
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

            //remove null data
            const res = clearData(user)

            return Promise.resolve({success: true, data: res})
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
            
            //Check if voter is valid before creating user
            let newVoter:Voter = new Voter(object.voter)
            await newVoter.validate()

            //Check if already exist a user with email and dni
            let existVoter = await Voter.findOne({
                where: { 
                    [Op.or]: [
                        { mail: object.voter.mail },
                        { dni: object.voter.dni }
                    ]
                }
            })

            if(existVoter != null){
                if(existVoter.mail == object.voter.mail){
                    return Promise.reject(new BadRequestError("Mail is already registered"))
                }else{
                    return Promise.reject(new BadRequestError("Dni is already registered"))
                }
            }

            object.roleId = RoleEnum.VOTER

            let newUser = await User.create(object, {
                include: [{
                        association: User.associations['voter']
                }]
            })

            //remove null data
            const res = clearData(newUser)
                       
            return Promise.resolve({success: true, data: res})
        } catch (error) {
            let errorRes: Error
            if (error instanceof UniqueConstraintError){
                errorRes = new BadRequestError("Username is already registered")
            }else if(error instanceof ValidationError){
                let msg = error.errors[0].message
                errorRes = new BadRequestError(msg)
            }else{
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

            //Check if organizer is valid before creating user
            let newOrganizer:Organizer = new Organizer(object.organizer)
            await newOrganizer.validate()

            object.roleId = RoleEnum.ORGANIZER

            let newUser = await User.create(object, {
                include: [{
                    association: User.associations['organizer']
                }]
            })

            //remove null data
            const res = clearData(newUser)

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            let errorRes: Error

            if (error instanceof UniqueConstraintError){
                errorRes = new BadRequestError("Username is already registered")
            }else if(error instanceof ValidationError){
                let msg = error.errors[0].message
                errorRes = new BadRequestError(msg)
            }else{
                errorRes = new InternalError(error)
            }

            return Promise.reject(errorRes)
        }
    }

    async registerCollaborator(object: User): Promise<Result> {
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

            //remove null data
            const res = clearData(newUser)

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            let errorRes: Error

            if (error instanceof UniqueConstraintError){
                errorRes = new BadRequestError("Username is already registered")
            }else if(error instanceof ValidationError){
                let msg = error.errors[0].message
                errorRes = new BadRequestError(msg)
            }else{
                errorRes = new InternalError(error)
            }

            return Promise.reject(errorRes)
        }
    }

    async loginVoter(username: string, password: string): Promise<Result> {
        try {
            const user = await User.scope('login').findOne({where: {username: username}})

            if( user == null ){
                return Promise.reject(new BadRequestError("The username inserted is does not exist"))
            }

            if(user.roleId != RoleEnum.VOTER){
                return Promise.reject(new NotPermittedError())
            }

            if(!bcrypt.compareSync(password, user.password)){
                return Promise.reject(new BadRequestError("The password inserted is incorrect"))
            }

            //get authentication token
            const token = createToken(user)

            //remove null data
            const res = clearData(user)
            res['token'] = token

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            return Promise.reject(new InternalError(error))
        }
    }
    
    async loginOrganizer(username: string, password: string): Promise<Result> {
        try {
            const user = await User.scope('login').findOne({where: {username: username}})

            if( user == null ){
                return Promise.reject(new BadRequestError("The username inserted is does not exist"))
            }

            if(user.roleId != RoleEnum.COLLABORATOR && user.roleId != RoleEnum.ORGANIZER){
                return Promise.reject(new NotPermittedError())
            }

            if(!bcrypt.compareSync(password, user.password)){
                return Promise.reject(new BadRequestError("The password inserted is incorrect"))
            }

            //get authentication token
            const token = createToken(user)

            //remove null data
            const res = clearData(user)
            res['token'] = token

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            return Promise.reject(new InternalError(error))
        }
    }

    async loginAdmin(username: string, password: string): Promise<Result> {
        try {
            const user = await User.scope('login').findOne({where: {username: username}})

            if( user == null ){
                return Promise.reject(new BadRequestError("The username inserted is does not exist"))
            }

            if(user.roleId != RoleEnum.ADMIN){
                return Promise.reject(new NotPermittedError())
            }

            if(!bcrypt.compareSync(password, user.password)){
                return Promise.reject(new BadRequestError("The password inserted is incorrect"))
            }

            //get authentication token
            const token = createToken(user)

            //remove null data
            const res = clearData(user)
            res['token'] = token

            return Promise.resolve({success: true, data: res})
        } catch (error) {
            return Promise.reject(new InternalError(error))
        }
    }
}