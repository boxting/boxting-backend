import { Router } from "express";
import {
    handleAddList,
    handleDeleteListById,
    handleUpdateListById,
    handleGetAllLists,
    handleDeleteAllLists
} from "../../controller/list.controller";
import { authenticateToken } from "../../middleware/jwt.middleware";
import { authenticateRole } from "../../middleware/role.middleware";
import { RoleEnum } from "../../utils/role.enum";

const router = Router()

router.get('/all', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleGetAllLists)

router.post('/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleAddList)

router.delete('/:listId/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleDeleteAllLists)

router.delete('/:listId/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleDeleteListById)

router.put('/:listId/election/:electionId', authenticateToken,
    authenticateRole([RoleEnum.ADMIN]), handleUpdateListById)

export { router as adminListApi }