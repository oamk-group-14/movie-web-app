import { pool } from './db.js'

export const addFavorite = async (
    userId,
    mediaId,
    mediaType,
    title,
    posterPath,
    releaseYear,
    voteAverage
) => {
    // Make sure the user has a favourite list
    const listResult = await pool.query(
        `
        INSERT INTO Favourite_Lists (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
        RETURNING list_id
        `,
        [userId]
    )

    let listId

    if (listResult.rows.length > 0) {
        listId = listResult.rows[0].list_id
    } else {
        const existingList = await pool.query(
            `
            SELECT list_id
            FROM Favourite_Lists
            WHERE user_id = $1
            `,
            [userId]
        )

        listId = existingList.rows[0].list_id
    }

    const result = await pool.query(
        `
        INSERT INTO Favourite_Items (
            list_id,
            movie_id,
            media_type,
            title,
            poster_path,
            release_year,
            vote_average
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (list_id, media_type, movie_id) DO NOTHING
        RETURNING *
        `,
        [
            listId,
            mediaId,
            mediaType,
            title,
            posterPath,
            releaseYear,
            voteAverage
        ]
    )

    return result.rows[0]
}

export const removeFavorite = async (userId, mediaId, mediaType) => {
    const result = await pool.query(
        `
        DELETE FROM Favourite_Items
        WHERE list_id = (
            SELECT list_id
            FROM Favourite_Lists
            WHERE user_id = $1
        )
        AND movie_id = $2
        AND media_type = $3
        RETURNING *
        `,
        [userId, mediaId, mediaType]
    )

    return result.rows[0]
}

export const getFavorites = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            fi.movie_id,
            fi.media_type,
            fi.title,
            fi.poster_path,
            fi.release_year,
            fi.vote_average,
            fi.added_at
        FROM Favourite_Items fi
        JOIN Favourite_Lists fl
            ON fi.list_id = fl.list_id
        WHERE fl.user_id = $1
        ORDER BY fi.added_at DESC
        `,
        [userId]
    )

    return result.rows
}