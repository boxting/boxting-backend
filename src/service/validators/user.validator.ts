import { BadRequestError } from "../../error/bad.request.error"
import { InternalError } from "../../error/base.error"
import { NotFoundError } from "../../error/not.found.error"
import { User } from "../../model/user.model"
import { Voter } from "../../model/voter.model"

export class UserValidator {

    public static async checkIfExists(userId: number) {
        try {
            // Find user with specified username
            const user: User | null = await User.findByPk(userId)

            // Check if an user was found
            if (user == null) {
                return Promise.reject(new NotFoundError(3001, "No user found with this id."))
            }

            return Promise.resolve(user)
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkIfExistsByUsername(username: string) {
        try {
            // Find user with specified username
            const user: User | null = await User.findOne({ where: { username: username } })

            // Check if an user was found
            if (user == null) {
                return Promise.reject(new NotFoundError(3003, "There is no user with the inserted id."))
            }

            return Promise.resolve(user)
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkIfMailIsRegistered(mail: string) {
        try {
            // Find user with specified username
            const user: User | null = await User.findOne({ where: { mail: mail } })

            // Check if an user was found
            if (user != null) {
                return Promise.reject(new BadRequestError(2005, "Mail is already registered."))
            }

            return Promise.resolve(true)
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkIfDNIIsRegistered(dni: string) {
        try {
            // Find user with specified dni
            const voter: Voter | null = await Voter.findOne({ where: { dni: dni } })

            // Check if an user was found
            if (voter != null) {
                return Promise.reject(new BadRequestError(2006, "Dni is already registered."))
            }

            return Promise.resolve(true)
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    public static async checkIfUsernameIsRegistered(username: string) {
        try {
            // Find user with specified username
            const user: User | null = await User.findOne({ where: { username: username } })

            // Check if an user was found
            if (user != null) {
                return Promise.reject(new BadRequestError(2001, "Username is already registered."))
            }

            return Promise.resolve(true)
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }
}