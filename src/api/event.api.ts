import { Router } from "express";
import { 
    handleDeleteEventWithToken, 
    handleGetAllEvents,
    handleGetEventById,
    handleGetEventByIdWithToken,
    handleUpdateEvent,
    handleUpdateEventWithToken,
    handleCreateEvent,
    handleCreateEventWithToken,
    handleSuscribeVoter,
    handleSuscribeVoterWithToken,
    handleAddCollaborator
} from "../controller/event.controller";

import { authenticateToken } from "../middleware/jwt.middleware";
import { authenticateRole } from "../middleware/role.middleware";
import { RoleEnum } from "../utils/role.enum";

const router = Router()

router.get('/get/all', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetAllEvents)
router.get('/:id/get', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetEventById)
router.post('/create', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleCreateEvent)
router.post('/suscribe/voter', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleSuscribeVoter)
router.post('/:id/add/collaborator', authenticateToken, authenticateRole([RoleEnum.ADMIN, RoleEnum.ORGANIZER]), handleAddCollaborator)
router.put('/:id/update', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleUpdateEvent)

router.post('/token/create', authenticateToken, authenticateRole([RoleEnum.ORGANIZER]), handleCreateEventWithToken)
router.post('/token/get/:id', authenticateToken, handleGetEventByIdWithToken)
router.delete('/token/delete/:id', authenticateToken, authenticateRole([RoleEnum.ORGANIZER, RoleEnum.ADMIN]), handleDeleteEventWithToken )
router.put('/token/update/:id', authenticateToken, authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleUpdateEventWithToken)
router.post('/token/suscribe/voter', authenticateToken, authenticateRole([RoleEnum.VOTER]), handleSuscribeVoterWithToken)


export { router as events }