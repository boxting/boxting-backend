import { Router } from "express";
import {
    handleAddElection,
    handleDeleteElectionById,
    handleUpdateElectionById,
    handleDeleteAllElections,
    handleGetAllElections
} from "../../controller/election.controller";
import { authenticateToken } from "../../middleware/jwt.middleware";
import { authenticateRole } from "../../middleware/role.middleware";
import { RoleEnum } from "../../utils/role.enum";

const router = Router()

router.get('/all', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleGetAllElections)

router.post('/event/:eventId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleAddElection)

router.delete('/:electionId/event/:eventId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleDeleteElectionById)

router.delete('/all', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleDeleteAllElections)

router.put('/:electionId/event/:eventId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleUpdateElectionById)

export { router as adminElectionApi }