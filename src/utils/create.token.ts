import { User } from "../model/user.model";
import * as jwt from 'jsonwebtoken'
import { Payload } from "../interface/request.interface";

export function createToken(user:User){

    if (process.env.ACCESS_TOKEN_SECRET != undefined) {

        const payload: Payload = {
            id: user.id,
            username: user.username,
            role: user.roleId
        }

        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15h' })
    }

    throw "Something went wrong creating token"
}