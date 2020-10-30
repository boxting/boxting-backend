import { Router } from "express";
import { 
    handleCreateAccessCodesOnEvent, 
    handleDeleteAllNotUsedFromEvent, 
    handleDeleteOneFromEvent, 
    handleGetAccessCodesFromEvent, 
    handleUpdateOneFromEvent
} from "../controller/access.code.controller";
import { authenticateToken } from "../middleware/jwt.middleware";
import { authenticateRole } from "../middleware/role.middleware";
import { RoleEnum } from "../utils/role.enum";

const router = Router()

router.post('/token/event/:eventId/create', authenticateToken, authenticateRole([RoleEnum.ORGANIZER]), handleCreateAccessCodesOnEvent)
router.get('/token/event/:eventId/get/all', authenticateToken, authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleGetAccessCodesFromEvent)
router.delete('/token/event/:eventId/delete/all', authenticateToken, authenticateRole([RoleEnum.ORGANIZER]), handleDeleteAllNotUsedFromEvent)
router.delete('/token/event/:eventId/delete/:codeId', authenticateToken, authenticateRole([RoleEnum.ORGANIZER]), handleDeleteOneFromEvent)
router.put('/token/event/:eventId/update/:codeId', authenticateToken, authenticateRole([RoleEnum.ORGANIZER]), handleUpdateOneFromEvent)


export { router as accessCodes }