import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { testUserPreferences } from '../controllers/recommendController.js'

const router = express.Router()

// Test endpoint for getting the logged-in user's reviews and favourites.
router.get('/test', authenticateToken, testUserPreferences)

export default router