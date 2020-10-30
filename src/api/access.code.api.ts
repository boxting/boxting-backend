import { Router } from "express";
import { 
    handleCreateAccessCodesOnEvent, handleGetAccessCodesFromEvent 
} from "../controller/access.code.controller";
import { authenticateToken } from "../middleware/jwt.middleware";
import { authenticateRole } from "../middleware/role.middleware";
import { RoleEnum } from "../utils/role.enum";

const router = Router()

router.post('/token/create', authenticateToken, authenticateRole([RoleEnum.ORGANIZER]), handleCreateAccessCodesOnEvent)
router.get('/token/get/all', authenticateToken, authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleGetAccessCodesFromEvent)


export { router as accessCodes }