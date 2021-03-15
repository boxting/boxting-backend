import { Router } from "express";
import {
    handleGetAllEvents,
    handleGetEventById,
    handleUpdateEventWithToken,
    handleCreateEvent,
    handlesubscribeVoter,
    handleUpdateContract
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
router.put('/id/:id/contract', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleUpdateContract)

export { router as adminEventApi }