import { Router } from "express";
import { 
    handleRegisterCollaborators, 
    handleRegisterVoters,
    handleRegisterOrganizers,
    handleLoginOrganizer,
    handleLoginVoter,
    handleLoginAdmin,
    handleGetDniInformation,
    handleForgotPassword
} from "../../controller/login.controller";

const router = Router()

// Register
router.post('/register/voter', handleRegisterVoters)
router.post('/register/collaborator', handleRegisterCollaborators)
router.post('/register/organizer', handleRegisterOrganizers)

// Login
router.post('/voter', handleLoginVoter)
router.post('/organizer', handleLoginOrganizer)
router.post('/admin', handleLoginAdmin)

// Identity Validation
router.get('/dni/:dni', handleGetDniInformation)

// Recover Password
router.post('/forgot/password', handleForgotPassword)

export { router as loginApi }