import express from 'express'
import { searchTvShows, getTvShow } from '../controllers/tvShowController.js'

const router = express.Router()

// Search TV shows
router.get('/search', searchTvShows)
// Get TV show by ID
router.get('/:id', getTvShow)

export default router