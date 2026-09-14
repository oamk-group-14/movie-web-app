import express from 'express'

import { getGenres, discoverMovies, discoverTvShows, getTvGenres } from '../controllers/genreController.js'

const router = express.Router()

//Get all movie genres
router.get('/genres', getGenres)

router.get('/tvGenres', getTvGenres)

//Get genres by id
router.get('/discover/movie/genre/:id', discoverMovies)

//Get tvShows by id
router.get('/discover/tv/genre/:id', discoverTvShows)

export default router
