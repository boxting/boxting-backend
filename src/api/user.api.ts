import { Router } from "express";
import { handleDeleteUserById, handleDeleteUsers, handleGetAllUsers, handleGetUserById, handleRegisterAdmins, handleRegisterCollaborators, handleRegisterOrganizers, handleRegisterVoters, handleUpdateUser } from "../controller/user.controller";

const router = Router()

router.get('/get', handleGetAllUsers)
router.post('/admin/add', handleRegisterAdmins)
router.post('/voter/add', handleRegisterVoters)
router.post('/organizer/add', handleRegisterOrganizers)
router.post('/collaborator/add', handleRegisterCollaborators)
router.get('/:id', handleGetUserById)
router.delete('/all', handleDeleteUsers)
router.delete('/:id', handleDeleteUserById)
router.put('/:id', handleUpdateUser)

export { router as users }