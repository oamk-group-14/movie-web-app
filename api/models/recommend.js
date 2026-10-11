import { pool } from "./db.js";

// Database model for later use when Favorites and Reviews backend is done
// Get movies from database that user has rated
export const getUserReviews = async (userId) => {
    // Run sql query to get movie ID and rating from user reviews
    // And sort the reviews from highest rating to lowest
    const result = await pool.query(
        `SELECT movie_id, rating
         FROM Reviews
         WHERE user_id = $1
         ORDER BY rating DESC`,
        [userId]
    )
    
    // Return rows from the database
    return result.rows
}

// Get movies that user has added their favorites
export const getUserFavorites = async (userId) => {
    // Run sql query to get user's favorite movies from favorite list
    const result = await pool.query(
        `SELECT movie_id
         FROM Favourite_Lists
         WHERE user_id = $1`,
        [userId]
    )

    return result.rows
}