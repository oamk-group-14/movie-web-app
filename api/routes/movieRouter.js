import express from 'express'

import { searchMovies, searchActors, getGenres, discoverMovies, getMovie, getNowShowing } from '../controllers/movieController.js'

const router = express.Router()

// Search movies
router.get('/search', searchMovies)

// Search actors
router.get('/actors/search', searchActors)

//Get all movie genres
router.get('/genres', getGenres)

// Search movies by genre
router.get('/genre/:id', discoverMovies)

// Movies currently in theatres
router.get('/now-showing', getNowShowing)

// Get movie by ID
router.get('/:id', getMovie)


export default router