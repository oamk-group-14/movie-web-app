import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication required'
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = decoded

        next()
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        })
    }
}

    //Gets token if there is one, but doesn't require it
    export const optionalAuth = (req, res, next) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next()
        }

        const token = authHeader.split(' ')[1]

        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            // Invalid token is ignored; the user is treated as not logged in
        }

        next()
    }
