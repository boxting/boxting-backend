// Interfaces
import { LoginInterface } from "../interface/login.interface"
import { Result } from "../../../interface/result.interface";
import { UserTokens } from "../../../interface/token.interface";
// Errors
import { InternalError } from "../../../error/base.error"
import { BadRequestError } from "../../../error/bad.request.error";
import { NotPermittedError } from "../../../error/not.permitted.error";
import { NotFoundError } from "../../../error/not.found.error";
// Models
import { Voter } from "../../user/model/voter.model";
import { Organizer } from "../../user/model/organizer.model";
import { User } from "../../user/model/user.model";
import { PasswordToken } from "../../token/model/password.token.model";
import { RefreshToken } from "../../token/model/refresh.token.model";
// Utils
import { RoleEnum } from "../../../utils/role.enum";
import { clearData } from "../../../utils/clear.response";
import { TokenManager } from "../../../utils/token.manager";
// Service
import { UserService } from "../../user/service/user.service";
import { MailingService } from "../../mailing/service/mailing.service";
// Package Imports
import { ValidationError } from "sequelize";
import bcrypt from "bcrypt"
import axios from "axios"
import crypto from "crypto"
import https from 'https'
import { UserValidator } from "../../user/validator/user.validator";

export class LoginService implements LoginInterface {

    private mailingService: MailingService
    private tokenManager: TokenManager

    constructor() {
        this.mailingService = MailingService.getConnection()
        this.tokenManager = TokenManager.getInstance()
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

            // Check if necessary fields are included 
            if (user.mail == null || user.voter.dni == null || user.username == null) {
                return Promise.reject(new BadRequestError(2003, 'Some necessary fields are missing.'))
            }

            // Validate unique data
            await UserValidator.checkIfDNIIsRegistered(user.voter.dni)
            await UserValidator.checkIfMailIsRegistered(user.mail)
            await UserValidator.checkIfUsernameIsRegistered(user.username)

            // Check if voter is valid before creating user
            let newVoter: Voter = new Voter(user.voter)
            await newVoter.validate()

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

            if (error instanceof ValidationError) {
                let msg = error.errors[0].message
                return Promise.reject(new BadRequestError(2003, msg))
            }

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }
            return Promise.reject(new InternalError(error))
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

            // Check if necessary fields are included 
            if (user.mail == null || user.username == null) {
                return Promise.reject(new BadRequestError(2003, 'Some necessary fields are missing.'))
            }

            // Validate unique data
            await UserValidator.checkIfMailIsRegistered(user.mail)
            await UserValidator.checkIfUsernameIsRegistered(user.username)

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

            if (error instanceof ValidationError) {
                let msg = error.errors[0].message
                return Promise.reject(new BadRequestError(2003, msg))
            }

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }
            return Promise.reject(new InternalError(error))
        }
    }

    async validateNotUsedDni(dni: string): Promise<Result> {

        try {
            const voter = await Voter.findOne({ where: { dni: dni } })

            if (voter != null) {
                return Promise.resolve({ success: false, data: 'DNI has an account associated.' })
            }

            return Promise.resolve({ success: true, data: 'DNI has no account associated.' })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }

    }

    async getDniInformation(dni: string): Promise<Result> {

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

            // Get authentication tokens
            const userTokens = await this.tokenManager.createTokens(user)

            // Store created tokens on table to handle refresh
            await RefreshToken.create({ token: userTokens.token, refreshToken: userTokens.refreshToken })

            // Remove null data
            const res = clearData(user)
            res['token'] = userTokens.token
            res['refreshToken'] = userTokens.refreshToken

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async closeSession(refreshToken: string): Promise<Result> {
        try {
            await RefreshToken.destroy({ where: { refreshToken: refreshToken } })

            return Promise.resolve({ success: true, data: 'Session closed!' })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async refreshToken(userTokens: UserTokens): Promise<Result> {
        try {

            // Validate if inserted tokens exists on db
            const tokens = await RefreshToken.findOne({ where: { token: userTokens.token, refreshToken: userTokens.refreshToken } })

            if (tokens == null) {
                return Promise.reject(new BadRequestError(1008, 'Inserted user tokens are invalid.'))
            }

            // If tokens found on db, refresh token with manager to get a new access token
            const refreshed = await this.tokenManager.refreshToken(userTokens.refreshToken)

            // Update access token on database
            tokens.token = refreshed
            await tokens.save()

            // Replace old access token
            userTokens.token = refreshed

            return Promise.resolve({ success: true, data: refreshed })
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

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
            if (passwordToken != null) {
                await passwordToken.destroy()
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
            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }
            return Promise.reject(new InternalError(error))
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
            if (passwordToken == null || !await bcrypt.compare(token, passwordToken.token)) {
                return Promise.reject(new NotFoundError(1006, 'The token inserted is incorrect.'))
            }

            // Validate if token is still valid
            const datePlus30 = new Date(passwordToken.createdAt.getTime() + 30 * 60000)

            if (Date.now() >= datePlus30.getTime()) {
                return Promise.reject(new BadRequestError(1007, 'The token inserted has expired.'))
            }

            return Promise.resolve({ success: true, data: 'Token is valid' })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async setNewPassword(userMail: string, token: string, newPassword: string): Promise<Result> {
        try {

            // Check if token is valid
            await this.validatePasswordToken(userMail, token)

            // Find user and token with specified id
            const user = await User.scope('login').findOne({ where: { mail: userMail } })
            const passwordToken = await PasswordToken.findOne({ where: { userId: user!.id } })

            // After token validation we are sure that user and token exists

            // Update user password
            user!.password = await bcrypt.hash(newPassword, 10)
            await user!.save()

            // Delete password token
            await passwordToken!.destroy()

            return Promise.resolve({ success: true, data: "New password set!" })
        } catch (error) {

            if (error.errorCode != undefined) {
                return Promise.reject(error)
            }

            return Promise.reject(new InternalError(500, error))
        }
    }
}