import { Router } from "express";
import {
    handleGetAllListsFromElection,
    handleAddList,
    handleGetListById,
    handleDeleteListById,
    handleUpdateListById
} from "../controller/list.controller";
import { authenticateToken } from "../../../middleware/jwt.middleware";
import { authenticateRole } from "../../../middleware/role.middleware";
import { RoleEnum } from "../../../utils/role.enum";

const router = Router()

router.get('/election/:electionId', authenticateToken, handleGetAllListsFromElection)

router.get('/:listId/election/:electionId', authenticateToken, handleGetListById)

router.post('/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleAddList)

router.delete('/:listId/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER]), handleDeleteListById)

router.put('/:listId/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ORGANIZER, RoleEnum.COLLABORATOR]), handleUpdateListById)

export { router as listApi }