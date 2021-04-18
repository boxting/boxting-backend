import { Request, Response, NextFunction } from 'express';
import { NotPermittedError } from '../error/not.permitted.error';
import { TokenRequest } from '../interface/request.interface';


export function authenticateRole(roles: number[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const tokenRequest = req as TokenRequest

        if (roles.indexOf(tokenRequest.user.role) == -1) {
            return res.status(403).send({ 'success': false, 'error': new NotPermittedError(403) });
        }

        next()
    }
}