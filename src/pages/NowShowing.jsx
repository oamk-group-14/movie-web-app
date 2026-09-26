import { useState, useEffect } from 'react'
import MediaCard from '../components/MediaCard'
import MediaGrid from '../components/MediaGrid'

function NowShowing() {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [favoriteIds, setFavoriteIds] = useState([])
    const [error, setError] = useState('')

    // Add or remove a movie from the favorites list
    const toggleFavorite = (id) => {
        setFavoriteIds((currentFavorites) => {
            if (currentFavorites.includes(id)) {
                return currentFavorites.filter(
                    (favoriteId) => favoriteId !== id
                )
            }

            return [...currentFavorites, id]
        })
    }

    useEffect(() => {
        let ignore = false

        const getNowShowing = async () => {
            try {
                const response = await fetch(
                    'http://localhost:3000/api/movies/now-showing'
                )
                if (!response.ok) {
                    throw new Error('Now showing fetch failed')
                }

                const data = await response.json()
                if (!ignore) setMovies(data)
            }

            catch (err) {
                console.error(err)
                if (!ignore) setError('Unable to load movies')
            }

            finally {
                if (!ignore) setLoading(false)
            }
        }

        getNowShowing()

        return () => { ignore = true }
    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    if (movies.length === 0) {
        return <p>No movies currently showing</p>
    }

    return (
        <div className="media-page">
            <h1>Now Showing</h1>

            <MediaGrid>
                {movies.map((movie) => (
                    <MediaCard
                        key={movie.id}
                        id={movie.id}
                        title={movie.title}
                        posterUrl={movie.posterUrl}
                        date={movie.year}
                        rating={movie.voteAverage}
                        type="movie"
                        isFavorite={favoriteIds.includes(movie.id)}
                        onFavoriteToggle={() => toggleFavorite(movie.id)}
                    />
                ))}
            </MediaGrid>
        </div>
    )
}

export default NowShowing