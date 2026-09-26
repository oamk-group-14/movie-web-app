import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { deleteMe } from '../controllers/userController.js'

const router = Router()

// Test data for testing My favorites- page before backend is added (remove later)
router.get('/favorites', (req, res) => {
    res.json([
        {
            id: 550,
            type: 'movie',
            title: 'Fight Club',
            posterUrl: 'https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
            year: '1999',
            voteAverage: 8.4
        },
        {
            id: 1399,
            type: 'tv',
            title: 'Game of Thrones',
            posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
            year: '2011',
            voteAverage: 8.4
        }
    ])
})

router.delete('/me', authenticateToken, deleteMe)

export default router