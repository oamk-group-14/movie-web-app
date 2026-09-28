import { pool } from './db.js'

export const addFavorite = async (userId, movieId) => {
    const result = await pool.query(
        `
        INSERT INTO Favourite_Lists (user_id, movie_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, movie_id) DO NOTHING
        RETURNING user_id, movie_id, list_name
        `,
        [userId, movieId]
    )

    return result.rows[0]
}

export const removeFavorite = async (userId, movieId) => {
    const result = await pool.query(
        `
        DELETE FROM Favourite_Lists
        WHERE user_id = $1
        AND movie_id = $2
        RETURNING user_id, movie_id
        `,
        [userId, movieId]
    )

    return result.rows[0]
}

export const getFavorites = async (userId) => {
    const result = await pool.query(
        `
        SELECT movie_id, list_name
        FROM Favourite_Lists
        WHERE user_id = $1
        ORDER BY movie_id
        `,
        [userId]
    )

    return result.rows
}