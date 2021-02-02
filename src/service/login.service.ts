// Interfaces
import { LoginInterface } from "../interface/service/login.interface"
import { Result } from "../interface/result.interface";
// Errors
import { InternalError } from "../error/base.error"
import { BadRequestError } from "../error/bad.request.error";
import { NotPermittedError } from "../error/not.permitted.error";
import { NotFoundError } from "../error/not.found.error";
// Models
import { Voter } from "../model/voter.model";
import { Organizer } from "../model/organizer.model";
import { User } from "../model/user.model";
// Utils
import { RoleEnum } from "../utils/role.enum";
import { clearData } from "../utils/clear.response";
import { createToken } from "../utils/create.token";
// Service
import { UserService } from "./user.service";
import { MailingService } from "./mailing.service";
// Package Imports
import { ValidationError, UniqueConstraintError } from "sequelize";
import bcrypt from "bcrypt"
import axios from "axios"
import crypto from "crypto"
// certificates
import https from 'https'
import { PasswordToken } from "../model/password.token.model";

export class LoginService implements LoginInterface {

    private userService: UserService
    private mailingService: MailingService

    constructor() {
        this.userService = new UserService()
        this.mailingService = MailingService.getConnection()
    }

    async registerVoter(user: User): Promise<Result> {
        try {

            // Validate if voter object is included in json body
            if (user.voter == null) {
                return Promise.reject(new BadRequestError(2004, "You must include a voter {} to register a voter"))
            }

            // Check if a password has been provided on json body
            if (user.password == null) {
                return Promise.reject(new BadRequestError(2002, 'Password cannot be null'))
            }

            // Encrypt password to protect data
            user.password = await bcrypt.hash(user.password, 10)

            // Check if voter is valid before creating user
            let newVoter: Voter = new Voter(user.voter)
            await newVoter.validate()

            // Check if exists a voter with provided mail or dni
            let existingVoter = await this.userService.getUserByDni(user.voter.dni)

            if (existingVoter != null) {
                return Promise.reject(new BadRequestError(2006, "Dni is already registered"))
            }

            // Assign voter role
            user.roleId = RoleEnum.VOTER

            // Add new user
            let newUser = await User.create(user, {
                include: [{
                    association: User.associations['voter']
                }]
            })

            // Remove null data
            const res = clearData(newUser)

            return Promise.resolve({ success: true, data: res })

        } catch (error) {

            let errorRes: Error

            if (error instanceof UniqueConstraintError) {
                errorRes = new BadRequestError(2001, "Username is already registered")
            } else if (error instanceof ValidationError) {
                let msg = error.errors[0].message
                errorRes = new BadRequestError(2003, msg)
            } else {
                errorRes = new InternalError(500, error)
            }

            return Promise.reject(errorRes)
        }
    }

    async registerOrganizer(user: User, isCollaborator: boolean = false): Promise<Result> {
        try {

            // Validate if organizer object is included in json body
            if (user.organizer == null) {
                return Promise.reject(new BadRequestError(2007, "You must include a organizer {} to register an organizer"))
            }

            // Check if a password has been provided on json body
            if (user.password == null) {
                return Promise.reject(new BadRequestError(2002, 'Password cannot be null'))
            }

            // Encrypt password to protect data
            user.password = await bcrypt.hash(user.password, 10)

            //Check if organizer is valid before creating user
            let newOrganizer: Organizer = new Organizer(user.organizer)
            await newOrganizer.validate()

            // Assign role
            user.roleId = (isCollaborator) ? RoleEnum.COLLABORATOR : RoleEnum.ORGANIZER

            let newUser = await User.create(user, {
                include: [{
                    association: User.associations['organizer']
                }]
            })

            // Remove null data
            const res = clearData(newUser)

            return Promise.resolve({ success: true, data: res })

        } catch (error) {

            let errorRes: Error

            if (error instanceof UniqueConstraintError) {
                errorRes = new BadRequestError(2001, "Username is already registered")
            } else if (error instanceof ValidationError) {
                let msg = error.errors[0].message
                errorRes = new BadRequestError(2003, msg)
            } else {
                errorRes = new InternalError(500, error)
            }

            return Promise.reject(errorRes)
        }
    }

    async getDniInformation(dni: string) {

        try {
            const httpsAgent = new https.Agent({ rejectUnauthorized: false });

            let BASE = "https://api.reniec.cloud/dni/"

            if (dni.trim().length == 0 || dni.trim().length < 8) {
                return Promise.reject(new BadRequestError(2008, "The ID length is incorrect"))
            }

            let URL = BASE + dni

            let res = await axios.get(URL, { httpsAgent })

            if (res.data == null) {
                return Promise.reject(new BadRequestError(2009, "No matching ID information was found"))
            }

            return Promise.resolve({ success: true, data: res.data })

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }

    }

    async login(username: string, password: string, role: number): Promise<Result> {
        try {
            const user = await User.scope('login').findOne({ where: { username: username } })

            if (user == null) {
                return Promise.reject(new BadRequestError(1001, "The username inserted does not exist"))
            }

            if (user.roleId != role && !(user.roleId == RoleEnum.COLLABORATOR && role == RoleEnum.ORGANIZER)) {
                return Promise.reject(new NotPermittedError(1003))
            }

            if (!await bcrypt.compare(password, user.password)) {
                return Promise.reject(new BadRequestError(1002, "The password inserted is incorrect"))
            }

            //get authentication token
            const token = createToken(user)

            //remove null data
            const res = clearData(user)
            res['token'] = token

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async forgotPassword(userMail: string): Promise<Result> {
        try {
            // Find user with provided mail
            const user = await User.scope('login').findOne({ where: { mail: userMail } })

            if (user == null) {
                return Promise.reject(new NotFoundError(1004, 'The mail inserted is not registered'))
            }

            // Check if previus password token exists
            const passwordToken = await PasswordToken.findOne({ where: { userId: user.id } })

            // If token found delete to create a new one
            if(passwordToken != null){
                await passwordToken.destroy()
                await passwordToken.save()
            }

            // Generate new random password
            var newToken = crypto.randomBytes(10).toString('hex')

            // Create new password token
            const tokenOptions = {
                token: await bcrypt.hash(newToken, 10),
                userId: user.id
            }

            await PasswordToken.create(tokenOptions)
            
            // Get user name for email
            let firstName = user.voter?.firstName.split(' ')[0]
            let firstLastName = user.voter?.lastName.split(' ')[0]
            let name = firstName + ' ' + firstLastName

            // Send mail using mailing service
            await this.mailingService.sendRecoverPasswordMail(userMail, newToken, name)

            return Promise.resolve({ success: true, data: 'Password token sent to mail' })
        } catch (error) {
            console.log(error)
            return Promise.reject(new InternalError(500, error))
        }
    }

    async validatePasswordToken(userMail: string, token: string): Promise<Result> {
        try {
            // Find user with provided mail
            const user = await User.scope('login').findOne({ where: { mail: userMail } })

            if (user == null) {
                return Promise.reject(new BadRequestError(1005, 'The mail inserted is invalid or is not registered.'))
            }

            // Check if previus password token exists
            const passwordToken = await PasswordToken.findOne({ where: { userId: user.id } })

            // Validate if token is exists and is correct
            if(passwordToken == null || !await bcrypt.compare(token, passwordToken.token)){
                return Promise.reject(new NotFoundError(1006, 'The token inserted is incorrect.'))
            }

            // Validate if token is still valid
            const datePlus30 = new Date(passwordToken.createdAt.getTime() + 30*60000)

            if(Date.now() >= datePlus30.getTime()){
                return Promise.reject(new BadRequestError(1007, 'The token inserted has expired.'))
            }

            return Promise.resolve({ success: true, data: 'Token is valid' })
        } catch (error) {
            console.log(error)
            return Promise.reject(new InternalError(500, error))
        }
    }
}