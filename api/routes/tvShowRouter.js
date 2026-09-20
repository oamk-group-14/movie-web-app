import express from 'express'
import { searchTvShows, getTvShow,searchActors } from '../controllers/tvShowController.js'

const router = express.Router()

// Search TV shows
router.get('/search', searchTvShows)
// Search actors
router.get('/actors/search', searchActors)
// Get TV show by ID
router.get('/:id', getTvShow)

export default router