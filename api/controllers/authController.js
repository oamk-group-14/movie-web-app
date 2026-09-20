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
            'SELECT id, email, password FROM users WHERE email = $1',
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
            user.password
        )

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            })
        }

        const token = jwt.sign(
            {
                id: user.id,
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
                id: user.id,
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