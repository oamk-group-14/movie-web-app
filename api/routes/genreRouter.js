import express from 'express'

import { getGenres, discoverMovies, discoverTvShows } from '../controllers/genreController.js'

const router = express.Router()

//Get all genres
router.get('/genres', getGenres)

//Get genres by id
router.get('/discover/movie/genre/:id', discoverMovies)

//Get tvShows by id
router.get('/discover/tv/genre/:id', discoverTvShows)

export default router
