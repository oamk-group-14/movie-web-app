import express from 'express'
import { searchTvShows, searchActors, discoverTvShows, getTvGenres, getTvShow } from '../controllers/tvShowController.js'

const router = express.Router()

// Search TV shows
router.get('/search', searchTvShows)

// Search actors
router.get('/actors/search', searchActors)

// Get all TV show genres
router.get('/genres', getTvGenres)

// Search TV shows by genre
router.get('/genre/:id', discoverTvShows)

// Get TV show by ID
router.get('/:id', getTvShow)

export default router