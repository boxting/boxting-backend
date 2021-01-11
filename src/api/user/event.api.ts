import { Router } from "express";
import { 
    handleDeleteEventWithToken, 
    handleGetEventByIdWithToken,
    handleUpdateEventWithToken,
    handleCreateEventWithToken,
    handleSuscribeVoterWithToken,
    handleAddCollaborator
} from "../../controller/event.controller";
import { authenticateToken } from "../../middleware/jwt.middleware";
import { authenticateRole } from "../../middleware/role.middleware";
import { RoleEnum } from "../../utils/role.enum";

const router = Router()

router.post('/:id/add/collaborator', authenticateToken, authenticateRole([RoleEnum.ADMIN, RoleEnum.ORGANIZER]), handleAddCollaborator)
router.post('/create', authenticateToken, authenticateRole([RoleEnum.ORGANIZER]), handleCreateEventWithToken)
router.get('/id/:id', authenticateToken, handleGetEventByIdWithToken)
router.delete('/id/:id', authenticateToken, authenticateRole([RoleEnum.ORGANIZER, RoleEnum.ADMIN]), handleDeleteEventWithToken )
router.put('/id/:id', authenticateToken, authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleUpdateEventWithToken)
router.post('/suscribe/voter', authenticateToken, authenticateRole([RoleEnum.VOTER]), handleSuscribeVoterWithToken)


export { router as eventApi }