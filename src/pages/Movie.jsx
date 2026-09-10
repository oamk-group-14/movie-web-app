import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Movie() {
    // Get movie ID from the URL
    const { id } = useParams();

    const [movie, setMovie] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        const getMovie = async () => {
            try {
                // Fetch movie details from backend
                const response = await fetch(
                    `http://localhost:3000/api/movies/${id}`
                )

                // Check if the request was successful
                if (!response.ok) {
                    throw new Error('Movie fetch failed')
                }

                const data = await response.json()
                setMovie(data);
            }

            catch (error) {
                console.error(error)
                setError('Unable to load movie')
            }
        }

        getMovie();
    }, [id])

    // Show error message if fetching fails
    if (error) {
        return <p>{error}</p>
    }

    // Show loading message while fetching
    if (!movie) {
        return <p>Loading...</p>
    }

    // Return movie details to frontend
    return (
        <div>
            <h1>{movie.title}</h1>

            {movie.poster_path && (
                <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                    width="200"
                />
            )}

            <p>{movie.overview}</p>
            <p>Release Date: {movie.release_date}</p>
            <p>Genres: {movie.genres.map((genre) => genre.name).join(', ')}</p>
            <p>Runtime: {movie.runtime}</p>
            <p>Vote Average: {movie.vote_average}</p>
        </div>
    )
}

export default Movie