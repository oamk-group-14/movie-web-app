import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function NowShowing() {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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
        <div>
            <h1>Now Showing</h1>

            <div>
                {movies.map((movie) => (
                    <div key={movie.id}>
                        <Link to={`/movies/${movie.id}`}>
                            <h2>{movie.title}</h2>

                            {movie.posterUrl && (
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    width="200"
                                />
                            )}
                        </Link>

                        {movie.year && <p>{movie.year}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NowShowing