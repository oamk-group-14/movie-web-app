import { pool } from './db.js';

// Finds the user by email
export const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM Users WHERE email = $1',
        [email]
    );
    return result.rows[0];
};

// Creates user
export const createUser = async (email, hashedPassword)=> {
    const result = await pool.query(
        'INSERT INTO Users (email, hashed_password) VALUES ($1, $2) RETURNING User_ID, email', [email, hashedPassword]
    );
    return result.rows[0];
};


