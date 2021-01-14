// Error
import { NotFoundError } from "../error/not.found.error";
import { InternalError } from "../error/base.error"
import { BadRequestError } from "../error/bad.request.error";
// Interface
import { Result } from "../interface/result.interface";
import { UserInterface } from "../interface/service/user.interface"
// Model
import { User } from "../model/user.model";
import { Event } from "../model/event.model";
import { Voter } from "../model/voter.model";
// Utils
import { clearData } from "../utils/clear.response";
// Packages
import { Op } from "sequelize";
import bcrypt from "bcrypt"

export class UserService implements UserInterface {

    async get(): Promise<Result> {
        try {
            // Find all users
            let users = await User.scope('full').findAll()

            // Remove null data
            const res = clearData(users)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async add(object: User): Promise<Result> {
        throw ("Not implemented")
    }

    async deleteAll(): Promise<Result> {
        try {
            // Delete all users
            let deleted = await User.destroy({ where: {} })

            return Promise.resolve({ success: true, data: `${deleted} objects deleted` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async delete(id: string): Promise<Result> {
        try {
            // Delete specific user by id
            await User.destroy({ where: { id: id } })

            return Promise.resolve({ success: true, data: 'Object deleted' })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getById(id: string): Promise<Result> {
        try {
            // Find single user by unique id
            let user = await User.scope('full').findByPk(id)

            // If result is null, no user was found with specified Id
            if (user == null) {
                return Promise.reject(new NotFoundError(3001, "No user found with this id"))
            }

            // Remove null data
            const res = clearData(user)

            return Promise.resolve({ success: true, data: res })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async update(id: string, object: User): Promise<Result> {
        try {
            if (object.password != null) {
                object.password = await bcrypt.hash(object.password, 10)
            }

            let changes = await User.update(object, { where: { id: id } })

            return Promise.resolve({ success: true, data: `User updated with ${changes} change(s)` })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async getAllEvents(userId: number): Promise<Result> {

        try {
            // Get all the events related to a user
            const user: User | null = await User.findByPk(userId, {
                include: [{
                    model: Event,
                    through: {
                        attributes: []
                    }
                }]
            })

            // If the user result is null, return error
            if (user == null) {
                Promise.reject(new NotFoundError(3001, "No user found with this id"))
            }

            // Remove null data
            const res = clearData(user?.events)

            return Promise.resolve({ success: true, data: res })

        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    async updatePassword(userId: number, oldPassword: string, newPassword: string): Promise<Result> {
        try {
            // Find user with specified id
            const user = await User.findByPk(userId)

            // Check if user was found
            if (user == null) {
                return Promise.reject(new NotFoundError(3001, "No user found with this id"))
            }

            // Verify if oldPassword is the same as the one in database
            if (!await bcrypt.compare(oldPassword, user.password)) {
                return Promise.reject(new BadRequestError(3002, "The old password inserted is incorrect"))
            }

            // Update user password
            user.password = await bcrypt.hash(newPassword, 10)
            user.save()

            return Promise.resolve({ success: true, data: "Password updated!" })
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    /*****   Internal Service Functions   *****/
    // This functions are only used by other functions as query provider

    async getUserByDni(dni: string): Promise<Voter | null> {
        try {
            // Get a voter with matching mail or dni
            let voter = await Voter.findOne({
                where: {
                    [Op.or]: [
                        { dni: dni }
                    ]
                }
            })

            return Promise.resolve(voter)
        }
        catch (error) {
            return Promise.reject(error)
        }
    }
}