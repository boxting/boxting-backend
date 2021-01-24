import { Router } from "express";
import {
    handleAddCandidate,
    handleDeleteCandidateById,
    handleUpdateCandidateById,
    handleGetAllCandidates,
    handleDeleteAllCandidates
} from "../../controller/candidate.controller";
import { authenticateToken } from "../../middleware/jwt.middleware";
import { authenticateRole } from "../../middleware/role.middleware";
import { RoleEnum } from "../../utils/role.enum";

const router = Router()

router.get('/all', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleGetAllCandidates)

router.post('/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleAddCandidate)

router.delete('/:candidateId/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleDeleteCandidateById)

router.delete('/all', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleDeleteAllCandidates)

router.put('/:candidateId/list/:listId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleUpdateCandidateById)

export { router as adminCandidateApi }