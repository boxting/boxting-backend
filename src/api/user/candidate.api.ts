import { Router } from "express";
import {
    handleGetAllCandidatesFromList,
    handleAddCandidate,
    handleGetCandidateById,
    handleDeleteCandidateById,
    handleUpdateCandidateById,
    handleGetAllCandidatesFromElection,
    handleGetCandidateByIdFromElection,
    handleUpdateCandidateByIdFromElection,
    handleDeleteCandidateByIdFromElection
} from "../../controller/candidate.controller";
import { authenticateToken } from "../../middleware/jwt.middleware";
import { authenticateRole } from "../../middleware/role.middleware";
import { RoleEnum } from "../../utils/role.enum";

const router = Router()

router.get('/list/:listId', authenticateToken, handleGetAllCandidatesFromList)

router.get('/election/:electionId', authenticateToken, handleGetAllCandidatesFromElection)

router.get('/:candidateId/list/:listId', authenticateToken, handleGetCandidateById)

router.get('/:candidateId/election/:electionId', authenticateToken, handleGetCandidateByIdFromElection)

router.post('/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleAddCandidate)

router.delete('/:candidateId/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleDeleteCandidateById)

router.delete('/:candidateId/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleDeleteCandidateByIdFromElection)

router.put('/:candidateId/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleUpdateCandidateById)

router.put('/:candidateId/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleUpdateCandidateByIdFromElection)

export { router as candidateApi }