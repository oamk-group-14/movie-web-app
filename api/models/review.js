import { pool } from "./db.js";

export const createReview = async(user_id, movie_id, title, media_type, review_text, rating) =>{

        const result = await pool.query(
            'INSERT INTO Reviews (user_id, movie_id, title, media_type, review_text, rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [ user_id, movie_id, title, media_type, review_text, rating]
        );
        return result.rows[0];

}

export const getAllReviews = async()=> {

    const result = await pool.query(
        'SELECT * FROM Reviews'
    );
    return result.rows;
}

export const getReviewsByMedia = async(movie_id, media_type)=> {
    const result = await pool.query(
    'SELECT * FROM Reviews WHERE movie_id = $1 AND media_type = $2',
    [movie_id, media_type]
    );
    return result.rows;
}
