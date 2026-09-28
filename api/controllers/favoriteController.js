import {
    addFavorite,
    removeFavorite,
    getFavorites
} from '../models/favorite.js'

export const addMovieToFavorites = async (req, res) => {
    try {
        const userId = req.user.id
        const { movieId } = req.body

        if (!movieId) {
            return res.status(400).json({
                error: 'Movie ID is required'
            })
        }

        const favorite = await addFavorite(userId, movieId)

        res.status(201).json({
            message: 'Movie added to favorites',
            favorite
        })

    } catch (error) {
        console.error('Error adding favorite:', error)

        res.status(500).json({
            error: 'Failed to add movie to favorites'
        })
    }
}

export const removeMovieFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id
        const movieId = req.params.movieId

        const favorite = await removeFavorite(userId, movieId)

        if (!favorite) {
            return res.status(404).json({
                error: 'Movie is not in favorites'
            })
        }

        res.json({
            message: 'Movie removed from favorites'
        })

    } catch (error) {
        console.error('Error removing favorite:', error)

        res.status(500).json({
            error: 'Failed to remove movie from favorites'
        })
    }
}

export const listFavorites = async (req, res) => {
    try {
        const userId = req.user.id

        const favorites = await getFavorites(userId)

        res.json({
            favorites
        })

    } catch (error) {
        console.error('Error getting favorites:', error)

        res.status(500).json({
            error: 'Failed to get favorites'
        })
    }
}