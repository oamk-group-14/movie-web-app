import express from 'express'

import { searchMovies, getMovie, getNowShowing } from '../controllers/movieController.js'

const router = express.Router()

// Movies currently in theatres
router.get('/now-showing', getNowShowing)
// Search movies
router.get('/search', searchMovies)
// Get movie by ID
router.get('/:id', getMovie)


export default router