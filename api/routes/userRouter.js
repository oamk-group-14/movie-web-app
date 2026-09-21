import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { deleteMe } from '../controllers/userController.js'

const router = Router()

router.delete('/me', authenticateToken, deleteMe)

export default router