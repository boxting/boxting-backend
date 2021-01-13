import { Router } from "express";
import { 
    handleGetUserWithToken,
    handleDeleteUserWithToken,
    handleUpdateUserWithToken,
    handleGetAllUserEventsWithToken,
    handleUpdatePassword
} from "../../controller/user.controller";
import { authenticateToken } from "../../middleware/jwt.middleware";

const router = Router()

router.get('/', authenticateToken, handleGetUserWithToken) 
router.get('/events', authenticateToken, handleGetAllUserEventsWithToken)
router.delete('/', authenticateToken, handleDeleteUserWithToken)
router.put('/', authenticateToken, handleUpdateUserWithToken)
router.put('/password', authenticateToken, handleUpdatePassword)

export { router as userApi }