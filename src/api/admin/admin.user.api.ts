import { Router } from "express";
import { 
    handleDeleteUserById, 
    handleDeleteUsers, 
    handleGetAllUsers, 
    handleGetUserById, 
    handleUpdateUser,
} from "../../controller/user.controller";
import { authenticateToken } from "../../middleware/jwt.middleware";
import { authenticateRole } from "../../middleware/role.middleware";
import { RoleEnum } from "../../utils/role.enum";

const router = Router()

router.get('/all', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetAllUsers)
router.delete('/all', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleDeleteUsers)
router.get('/id/:id', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetUserById) 
router.delete('/id/:id', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleDeleteUserById)
router.put('id/:id', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleUpdateUser)

export { router as adminUserApi }