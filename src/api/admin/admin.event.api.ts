import { Router } from "express";
import { 
    handleGetAllEvents,
    handleGetEventById,
    handleUpdateEvent,
    handleCreateEvent,
    handleSuscribeVoter
} from "../../controller/event.controller";

import { authenticateToken } from "../../middleware/jwt.middleware";
import { authenticateRole } from "../../middleware/role.middleware";
import { RoleEnum } from "../../utils/role.enum";

const router = Router()

router.get('/all', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetAllEvents)
router.get('/id/:id/', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetEventById)
router.post('/create', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleCreateEvent)
router.post('/suscribe/voter', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleSuscribeVoter)
router.put('/id/:id', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleUpdateEvent)

export { router as adminEventApi }