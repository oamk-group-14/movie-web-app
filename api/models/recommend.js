import { pool } from './db.js';

// Get the logged-in user's reviews for movies or TV shows
export const getUserReviews = async (userId, mediaType) => {
    const result = await pool.query(
        `
        SELECT movie_id, media_type, title, rating, review_text
        FROM Reviews
        WHERE user_id = $1
          AND media_type = $2
        ORDER BY rating DESC
        `,
        [userId, mediaType]
    );

    return result.rows;
};

// Get the logged-in user's favorites for movies or TV shows
export const getUserFavorites = async (userId, mediaType) => {
    const result = await pool.query(
        `
        SELECT
            fi.movie_id,
            fi.media_type,
            fi.title,
            fi.vote_average
        FROM Favourite_Items fi
        JOIN Favourite_Lists fl
            ON fi.list_id = fl.list_id
        WHERE fl.user_id = $1
          AND fi.media_type = $2
        ORDER BY fi.added_at DESC
        `,
        [userId, mediaType]
    );

    return result.rows;
};