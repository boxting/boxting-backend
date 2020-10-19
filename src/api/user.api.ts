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
    handleUpdateUser } from "../controller/user.controller";

const router = Router()

router.get('/get/all', handleGetAllUsers)
router.get('/:id', handleGetUserById) 
router.delete('/delete/all', handleDeleteUsers)
router.delete('/:id', handleDeleteUserById)
router.put('/:id', handleUpdateUser)

//Register
router.post('/voter/add', handleRegisterVoters)
router.post('/collaborator/add', handleRegisterCollaborators)
router.post('/organizer/add', handleRegisterOrganizers)

//LOGIN
router.post('/voter/login', handleLoginVoter)
router.post('/organizer/login', handleLoginOrganizer)
router.post('/admin/login', handleLogin)

export { router as users }