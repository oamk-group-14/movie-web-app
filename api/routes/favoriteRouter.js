import express from 'express'
import {
    addMovieToFavorites,
    removeMovieFromFavorites,
    listFavorites
} from '../controllers/favoriteController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, listFavorites)
router.post('/', authenticateToken, addMovieToFavorites)
router.delete('/:movieId', authenticateToken, removeMovieFromFavorites)

export default router