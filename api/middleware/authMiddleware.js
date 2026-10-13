import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';

// Stores revoked tokens in memory until they expire.
// The list is shared by the middleware and authController.
const revokedTokens = new Map();

const hashToken = (token) =>
    createHash('sha256').update(token).digest('hex');

export const revokeToken = (token, expiresAt) => {
    const now = Math.floor(Date.now() / 1000);

    // Remove expired entries to keep the list smaller.
    for (const [hash, expiry] of revokedTokens) {
        if (expiry <= now) {
            revokedTokens.delete(hash);
        }
    }

    revokedTokens.set(hashToken(token), expiresAt);
};

export const isTokenRevoked = (token) => {
    const hash = hashToken(token);
    const expiry = revokedTokens.get(hash);

    if (!expiry) {
        return false;
    }

    if (expiry <= Math.floor(Date.now() / 1000)) {
        revokedTokens.delete(hash);
        return false;
    }

    return true;
};

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (isTokenRevoked(token)) {
            return res.status(401).json({
                error: 'Token has been revoked'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
};

// Gets the token if there is one, but doesn't require it.
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!isTokenRevoked(token)) {
            req.user = decoded;
        }
    } catch (error) {
        // Invalid tokens are ignored for optional authentication.
    }

    next();
};
