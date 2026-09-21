import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../models/db.js'

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            })
        }

        const result = await pool.query(
            'SELECT user_id, email, hashed_password FROM users WHERE email = $1',
            [email]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password'
            })
        }

        const user = result.rows[0]

        const passwordMatch = await bcrypt.compare(
            password,
            user.hashed_password
        )

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            })
        }

        const token = jwt.sign(
            {
                id: user.user_id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        )

        res.json({
            token,
            user: {
                id: user.user_id,
                email: user.email
            }
        })

    } catch (error) {
        console.error('Login error:', error)

        res.status(500).json({
            error: 'An error occurred on the server'
        })
    }
}

import { createUser, findUserByEmail } from '../models/user.js';

export const register = async (req, res) => {
    const { email, password} = req.body;

    try {
        if ( !email || !password){
            return res.status(400).json({ message: 'All fields are required' });
        }

        //Checks that the email is not already used
        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check that the password is at least 8 characters long and uses both numbers and letters
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and it must contain numbers and letters"})
        }
    
        //Hashes the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Creates the new user
        const newUser = await createUser(email, hashedPassword);
        return res.status(201).json({ message: 'User registered successfully', user: newUser});
    
    } catch (err) {
        return res.status(500).json({ message: 'Server error'});
    };

}
