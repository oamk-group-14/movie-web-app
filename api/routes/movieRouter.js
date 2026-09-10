import express from 'express'

import { searchMovies, getMovie } from '../controllers/movieController.js'

const router = express.Router()

// Search movies
router.get('/search', searchMovies)
// Get movie by ID
router.get('/:id', getMovie)

export default router