import { Router } from "express";
import {
    handleDeleteEventWithToken,
    handleGetEventByIdWithToken,
    handleUpdateEventWithToken,
    handleCreateEventWithToken,
    handlesubscribeVoterWithToken,
    handleAddCollaborator,
    handleAddCollaboratorWithUsername,
    handleGetAllCollaborators,
    handleGetAllVoters,
    handleUnsubscribeVoterWithToken,
    handleUnsubscribeUser,
    handleInitContract
} from "../controller/event.controller";
import { authenticateToken } from "../../../middleware/jwt.middleware";
import { authenticateRole } from "../../../middleware/role.middleware";
import { RoleEnum } from "../../../utils/role.enum";

const router = Router()

router.post('/:id/add/collaborator', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleAddCollaborator)

router.post('/:id/add/collaborator/:username', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleAddCollaboratorWithUsername)

router.get('/:id/collaborators', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleGetAllCollaborators)

router.get('/:id/voters', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleGetAllVoters)

router.post('/create', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleCreateEventWithToken)

router.get('/id/:id', authenticateToken, handleGetEventByIdWithToken)

router.delete('/id/:id', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.ADMIN]), handleDeleteEventWithToken)

router.put('/id/:id', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleUpdateEventWithToken)

router.post('/subscribe/voter', authenticateToken,
    authenticateRole([RoleEnum.VOTER]), handlesubscribeVoterWithToken)

router.delete('/:id/unsubscribe/voter', authenticateToken,
    authenticateRole([RoleEnum.VOTER]), handleUnsubscribeVoterWithToken)

router.delete('/:id/unsubscribe/user/:userId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleUnsubscribeUser)

router.post('/:id/contract/init', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.ADMIN]), handleInitContract)

export { router as eventApi }