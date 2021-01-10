import { Router } from "express";
import { 
    handleDeleteUserById, 
    handleDeleteUsers, 
    handleGetAllUsers, 
    handleGetUserById, 
    handleLogin, 
    handleLoginOrganizer, 
    handleLoginVoter, 
    handleRegisterCollaborators, 
    handleRegisterOrganizers, 
    handleRegisterVoters, 
    handleUpdateUser,
    handleGetUserByToken,
    handleDeleteUserByToken,
    handleUpdateUserByToken,
    handleGetAllUserEvents,
    handleGetUserDniData} from "../controller/user.controller";
import { authenticateToken } from "../middleware/jwt.middleware";
import { authenticateRole } from "../middleware/role.middleware";
import { RoleEnum } from "../utils/role.enum";

const router = Router()

router.get('/get/all', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetAllUsers)
router.delete('/delete/all', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleDeleteUsers)
router.get('/:id', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleGetUserById) 
router.delete('/:id', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleDeleteUserById)
router.put('/:id', authenticateToken, authenticateRole([RoleEnum.ADMIN]), handleUpdateUser)

//Token based routes
router.get('/token/:id', authenticateToken, handleGetUserByToken) 
router.get('/token/events/get', authenticateToken, handleGetAllUserEvents)
router.delete('/token/:id', authenticateToken, handleDeleteUserByToken)
router.put('/token/:id', authenticateToken, handleUpdateUserByToken)

//Register
router.post('/voter/add', handleRegisterVoters)
router.post('/collaborator/add', handleRegisterCollaborators)
router.post('/organizer/add', handleRegisterOrganizers)

//LOGIN
router.post('/voter/login', handleLoginVoter)
router.post('/organizer/login', handleLoginOrganizer)
router.post('/admin/login', handleLogin)

router.get('/voter/:dni', handleGetUserDniData)

export { router as users }