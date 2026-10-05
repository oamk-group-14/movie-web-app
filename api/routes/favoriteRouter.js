import express from 'express'

import {
    addToFavorites,
    removeFromFavorites,
    listFavorites
} from '../controllers/favoriteController.js'

import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, listFavorites)
router.post('/', authenticateToken, addToFavorites)
router.delete('/:mediaType/:mediaId', authenticateToken, removeFromFavorites)

export default router