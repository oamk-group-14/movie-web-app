import express from 'express'

import {
    addToFavorites,
    removeFromFavorites,
    listFavorites,
    getShareLink,
    getSharedFavorites
} from '../controllers/favoriteController.js'

import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, listFavorites)
router.post('/', authenticateToken, addToFavorites)

// Returns the logged-in user's share token
router.get('/share', authenticateToken, getShareLink)

// Public: anyone with the link can view the list
router.get('/shared/:shareToken', getSharedFavorites)

router.delete('/:mediaType/:mediaId', authenticateToken, removeFromFavorites)

export default router