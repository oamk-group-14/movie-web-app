import {
    getUserReviews,
    getUserFavorites
} from '../models/recommend.js'

export const testUserPreferences = async (req, res) => {
    try {
        // Get the logged-in user's ID from the authentication token.
        const userId = req.user.id

        // Get the user's reviews from the database.
        const reviews = await getUserReviews(userId)

        // Get the user's favourites from the database.
        const favorites = await getUserFavorites(userId)

        // Return the user's reviews and favourites as JSON.
        res.json({
            reviews,
            favorites
        })

    } catch (error) {
        console.error('Failed to get user preferences:', error)

        res.status(500).json({
            error: 'Could not get user preferences'
        })
    }
}