import { useState } from 'react';
import { Link } from 'react-router-dom';

function Movies() {
    const [query, setQuery] = useState('')
    const [movies, setMovies] = useState([])
    const [error, setError] = useState('')

    const searchMovies = async () => {
        // Check that the search field is not empty
        if (!query.trim()) {
            setError('Please enter a movie title')
            return
        }

        try {
            setError('')

            // Search movies through the backend
            const response = await fetch(
                `http://localhost:3000/api/movies/search?query=${encodeURIComponent(query)}`
            )

            // Check if the request was successful
            if (!response.ok) {
                throw new Error('Movie search failed')
            }

            const data = await response.json()

            // Save search results to state
            setMovies(data.results || [])
        }

        catch (error) {
            console.error(error)
            setError('Unable to search for movies')
        }
    }

    // Return movie details to frontend
    return (
        <div>
            <h1>Movies</h1>

            <input
                type="text"
                placeholder="Search movies..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />

            <button onClick={searchMovies}>
                Search
            </button>

            {error && <p>{error}</p>}

            <div>
                {movies.map((movie) => (
                    <div key={movie.id}>
                        {/*Link to movie page*/}
                        <Link to={`/movies/${movie.id}`}> 
                            <h2>{movie.title}</h2>

                            {movie.poster_path && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                    alt={movie.title}
                                    width="200"
                                />
                            )}
                        </Link>

                        <p>{movie.release_date}</p>
                        <p>{movie.vote_average}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Movies