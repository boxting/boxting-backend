import { Router } from "express";
import {
    handleGetAllCandidatesFromList,
    handleAddCandidate,
    handleGetCandidateById,
    handleDeleteCandidateById,
    handleUpdateCandidateById,
    handleGetAllCandidatesFromElection
} from "../../controller/candidate.controller";
import { authenticateToken } from "../../middleware/jwt.middleware";
import { authenticateRole } from "../../middleware/role.middleware";
import { RoleEnum } from "../../utils/role.enum";

const router = Router()

router.get('/list/:listId', authenticateToken, handleGetAllCandidatesFromList)

router.get('/election/:electionId', authenticateToken, handleGetAllCandidatesFromElection)

router.get('/:candidateId/list/:listId', authenticateToken, handleGetCandidateById)

router.post('/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleAddCandidate)

router.delete('/:candidateId/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleDeleteCandidateById)

router.put('/:candidateId/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleUpdateCandidateById)

export { router as candidateApi }