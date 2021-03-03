import { Router } from "express";
import {
    handleGetAllEvents,
    handleGetEventById,
    handleUpdateEventWithToken,
    handleCreateEvent,
    handlesubscribeVoter
} from "../controller/event.controller";

import { authenticateToken } from "../../../middleware/jwt.middleware";
import { authenticateRole } from "../../../middleware/role.middleware";
import { RoleEnum } from "../../../utils/role.enum";

const router = Router()

router.get('/all', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetAllEvents)
router.get('/id/:id/', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetEventById)
router.post('/create', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleCreateEvent)
router.post('/subscribe/voter', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handlesubscribeVoter)
router.put('/id/:id', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleUpdateEventWithToken)

export { router as adminEventApi }