import express from 'express'
import { searchTvShows, searchActors, discoverTvShows, getTvGenres, getTvShow, getPopularTvShows } from '../controllers/tvShowController.js'

const router = express.Router()

// Search TV shows
router.get('/search', searchTvShows)

// Search actors
router.get('/actors/search', searchActors)

// Get all TV show genres
router.get('/genres', getTvGenres)

// Search TV shows by genre
router.get('/genre/:id', discoverTvShows)

// Get popular TV shows
router.get('/popular', getPopularTvShows)

// Get TV show by ID
router.get('/:id', getTvShow)

export default router