import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { deleteMe } from '../controllers/userController.js'

const router = Router()

// Test data for testing My favorites- page before backend is added (remove later)
router.get('/favorites', authenticateToken, (req, res) => {
    
})

router.delete('/me', authenticateToken, deleteMe)

export default router