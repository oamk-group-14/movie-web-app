import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import errorHandler from './middleware/errorHandler.js'
import testRouter from './routes/testRouter.js'
import movieRouter from './routes/movieRouter.js'
import tvShowRouter from './routes/tvShowRouter.js'
import authRouter from './routes/authRouter.js'
import userRouter from './routes/userRouter.js'
import favoriteRouter from './routes/favoriteRouter.js'

import groupRouter from './routes/groupRouter.js';
import reviewRouter from './routes/reviewRouter.js'

const port = process.env.PORT || 3000

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', testRouter);
app.use('/api/movies', movieRouter);
app.use('/api/tvshows', tvShowRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/favorites', favoriteRouter)


app.use('/groups', groupRouter);
app.use('/api/reviews', reviewRouter)

// Health check endpoint for database connectivity
app.get('/api/health', async (req, res) => {
  try {
    const { pool } = await import('./models/db.js')
    await pool.query('SELECT 1')
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})

app.use(errorHandler)

app.listen(port, () => {  
  console.log(`Server is running on http://localhost:${port}`)
  console.log('Backend hot reload is working!')
})