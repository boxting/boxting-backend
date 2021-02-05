import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes"
import { LoginService } from "../service/login.service";
import { RoleEnum } from "../utils/role.enum";

const loginService = new LoginService()

export async function handleRegisterVoters(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await loginService.registerVoter(user)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRegisterOrganizers(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await loginService.registerOrganizer(user)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRegisterCollaborators(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.body
        const data = await loginService.registerOrganizer(user, true)
        res.status(Status.CREATED).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleLoginAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body
        const data = await loginService.login(username, password, RoleEnum.ADMIN)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleLoginVoter(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body
        const data = await loginService.login(username, password, RoleEnum.VOTER)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleLoginOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body
        const data = await loginService.login(username, password, RoleEnum.ORGANIZER)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleCloseSession(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.params.refreshToken

        const data = await loginService.closeSession(refreshToken)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleRefreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const { token, refreshToken } = req.body
        const data = await loginService.refreshToken({ token: token, refreshToken: refreshToken })
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleValidateNotUsedDni(req: Request, res: Response, next: NextFunction) {
    try {
        let dni = req.params.dni
        const data = await loginService.validateNotUsedDni(dni)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleGetDniInformation(req: Request, res: Response, next: NextFunction) {
    try {
        let dni = req.params.dni
        const data = await loginService.getDniInformation(dni)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { mail } = req.body
        const data = await loginService.forgotPassword(mail)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleValidatePasswordToken(req: Request, res: Response, next: NextFunction) {
    try {
        const { mail, token } = req.body
        const data = await loginService.validatePasswordToken(mail, token)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}

export async function handleSetNewPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { mail, token, newPassword } = req.body

        const data = await loginService.setNewPassword(mail, token, newPassword)
        res.status(Status.OK).send(data)
    } catch (error) {
        next(error)
    }
}