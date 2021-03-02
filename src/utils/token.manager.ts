import jwt from 'jsonwebtoken'
import { User } from '../components/user/model/user.model'
import { BadRequestError } from '../error/bad.request.error'
import { Payload } from '../interface/request.interface'
import { UserTokens } from '../interface/token.interface'

export class TokenManager {

    private static _instance: TokenManager

    createTokens(user: User): Promise<UserTokens> {
        try {
            // Check if we have access and refresh token secret from env variables
            if (process.env.ACCESS_TOKEN_SECRET == undefined || process.env.REFRESH_TOKEN_SECRET == undefined) {

                // If undefined, write log with specific error and return generic error
                console.log('ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET has not been set correctly.')
                return Promise.reject('Something went wrong.')
            }

            const payload: Payload = {
                id: user.id,
                username: user.username,
                role: user.roleId
            }

            const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15h' })
            const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)

            return Promise.resolve({ token: token, refreshToken: refreshToken })
        } catch (error) {
            return Promise.reject(error)
        }
    }

    verifyToken(token: string): Promise<Payload> {
        try {

            // Check if we have access token secret from env variables
            if (process.env.ACCESS_TOKEN_SECRET == undefined) {

                // If undefined, write log with specific error and return generic error
                console.log('ACCESS_TOKEN_SECRET has not been set correctly.')
                return Promise.reject('Something went wrong.')
            }

            // Verify if token is valid
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

            // If token is valid, decode it to get the payload
            const decoded = jwt.decode(token, { complete: true }) as { [key: string]: any }

            // Assign payload to return variable
            const payload = decoded.payload as Payload

            return Promise.resolve(payload)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    verifyRefreshToken(refreshToken: string): Promise<Payload> {
        try {

            // Check if we have access token secret from env variables
            if (process.env.REFRESH_TOKEN_SECRET == undefined) {

                // If undefined, write log with specific error and return generic error
                console.log('REFRESH_TOKEN_SECRET has not been set correctly.')
                return Promise.reject('Something went wrong.')
            }

            // Verify if token is valid
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

            // If token is valid, decode it to get the payload
            const decoded = jwt.decode(refreshToken, { complete: true }) as { [key: string]: any }

            // Assign payload to return variable
            const payload = decoded.payload as Payload

            return Promise.resolve(payload)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async refreshToken(refreshToken: string): Promise<string> {
        try {

            // Validate if refresh token is valid
            const payload = await this.verifyRefreshToken(refreshToken)

            // Check if we have access and refresh token secret from env variables
            if (process.env.ACCESS_TOKEN_SECRET == undefined || process.env.REFRESH_TOKEN_SECRET == undefined) {

                // If undefined, write log with specific error and return generic error
                console.log('ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET has not been set correctly.')
                return Promise.reject('Something went wrong.')
            }
            // Create new payload to get new token
            const newPayload: Payload = {
                id: payload.id,
                role: payload.role,
                username: payload.username
            }
            // Create new token
            const token = jwt.sign(newPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15h' })
            console.log(token)
            return Promise.resolve(token)
        } catch (error) {
            return Promise.reject(new BadRequestError(1009, 'The refresh token is invalid.'))
        }
    }

    public static getInstance() {
        return this._instance || (this._instance = new this())
    }
}