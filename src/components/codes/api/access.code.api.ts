import { Router } from "express";
import {
    handleCreateAccessCodesOnEvent,
    handleDeleteAllNotUsedFromEvent,
    handleDeleteOneFromEvent,
    handleGetAccessCodesFromEvent,
    handleUpdateOneFromEvent
} from "../controller/access.code.controller";
import { authenticateToken } from "../../../middleware/jwt.middleware";
import { authenticateRole } from "../../../middleware/role.middleware";
import { RoleEnum } from "../../../utils/role.enum";

const router = Router()

router.post('/event/:eventId/create', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleCreateAccessCodesOnEvent)

router.get('/event/:eventId/all', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleGetAccessCodesFromEvent)

router.delete('/event/:eventId/all', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleDeleteAllNotUsedFromEvent)

router.delete('/event/:eventId/id/:codeId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleDeleteOneFromEvent)

router.put('/event/:eventId/id/:codeId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleUpdateOneFromEvent)


export { router as accessCodeApi }