import { useState } from 'react';
import { Link } from 'react-router-dom';

function Movies() {
    const [query, setQuery] = useState('')
    const [movies, setMovies] = useState([])
    const [actors, setActors] = useState([])
    const [error, setError] = useState('')

    const search = async () => {
        if (!query.trim()) {
            setError('Please enter a movie title or actor name')
            return
        }

        try {
            setError('')

            const actorResponse = await fetch(
                `http://localhost:3000/api/movies/actors/search?query=${encodeURIComponent(query)}`
            )

            const movieResponse = await fetch(
                `http://localhost:3000/api/movies/search?query=${encodeURIComponent(query)}`
            )

            if (!movieResponse.ok || !actorResponse.ok) {
                throw new Error('Search failed')
            }

            const actorData = await actorResponse.json()
            const movieData = await movieResponse.json()
            
            setActors(actorData.results || [])
            setMovies(movieData.results || [])
            

        } catch (error) {
            console.error(error)
            setError('Unable to search')
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
            
            <button onClick={search}>
                Search
            </button>
            

            {error && <p>{error}</p>}

            <div>
                {actors.map((movie) => (
                    <div key={movie.id}>
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