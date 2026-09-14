import express from 'express'

import { searchMovies, getMovie, searchActors } from '../controllers/movieController.js'

const router = express.Router()

// Search movies
router.get('/search', searchMovies)

// Search actors
router.get('/actors/search', searchActors)

// Get movie by ID
router.get('/:id', getMovie)

export default router