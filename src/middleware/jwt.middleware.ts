import { Response, NextFunction } from 'express'
import { TokenManager } from '../utils/token.manager'

const tokenManager = TokenManager.getInstance()

export async function authenticateToken(req: any, res: Response, next: NextFunction) {

    // Get current value from authorization header
    const authHeader = req.headers['authorization']

    // Validate that auth header has a value
    if (authHeader == undefined) {
        return res.status(401).send('No token found in authorization header, no authorized')
    }

    // Split the auth header to verify both parts
    const authSplit = authHeader.split(' ')

    // Check if the first part is te Bearer validator
    if (authSplit[0] != 'Bearer') {
        return res.status(401).send('Invalid token in authorization header')
    }

    // Assign second part to token variable
    const token = authSplit[1]

    try {
        // If token is valid, assign payload to request user
        req.user = await tokenManager.verifyToken(token)
        // Continue with request
        next()
    } catch (error) {
        // Token is not valid
        return res.status(401).send('Invalid token in authorization header')
    }
}