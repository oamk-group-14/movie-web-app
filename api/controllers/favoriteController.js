import {
    addFavorite,
    removeFavorite,
    getFavorites
} from '../models/favorite.js'

export const addToFavorites = async (req, res) => {
    try {
        const userId = req.user.id

        const {
            mediaId,
            mediaType,
            title,
            posterPath,
            releaseYear,
            voteAverage
        } = req.body

        if (!mediaId) {
            return res.status(400).json({
                error: 'Movie or TV show ID is required'
            })
        }

        if (!mediaType || !['movie', 'tv'].includes(mediaType)) {
            return res.status(400).json({
                error: 'mediaType must be movie or tv'
            })
        }

        if (!title) {
            return res.status(400).json({
                error: 'Title is required'
            })
        }

        const favorite = await addFavorite(
            userId,
            mediaId,
            mediaType,
            title,
            posterPath,
            releaseYear,
            voteAverage
        )

        if (!favorite) {
            return res.status(409).json({
                error: 'Item is already in favorites'
            })
        }

        res.status(201).json({
            message: 'Added to favorites',
            favorite
        })

    } catch (error) {
        console.error('Error adding favorite:', error)

        res.status(500).json({
            error: 'Failed to add to favorites'
        })
    }
}

export const removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id
        const { mediaType, mediaId } = req.params

        if (!['movie', 'tv'].includes(mediaType)) {
            return res.status(400).json({
                error: 'mediaType must be movie or tv'
            })
        }

        const favorite = await removeFavorite(
            userId,
            mediaId,
            mediaType
        )

        if (!favorite) {
            return res.status(404).json({
                error: 'Item is not in favorites'
            })
        }

        res.json({
            message: 'Removed from favorites'
        })

    } catch (error) {
        console.error('Error removing favorite:', error)

        res.status(500).json({
            error: 'Failed to remove from favorites'
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