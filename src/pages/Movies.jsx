import { useState } from 'react';
import { Link } from 'react-router-dom';

function Movies() {
    const [query, setQuery] = useState('')
    const [movies, setMovies] = useState([])
   // const [actorQuery, setActorQuery] = useState('')
    const [actors, setActors] = useState([])
    const [error, setError] = useState('')

    /*const searchMovies = async () => {
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
            console.log(data)

            // Save search results to state
            setMovies(data.results || [])
        }

        catch (error) {
            console.error(error)
            setError('Unable to search for movies')
        }
    }

    const searchActors = async () => {
        if (!query.trim()) {
            setError('Please enter an actor name')
            return
        }

        try {
            setError('')

            const response = await fetch(
                `http://localhost:3000/api/movies/actors/search?query=${encodeURIComponent(query)}`
            )

            if (!response.ok) {
                throw new Error('Actor search failed')
            }

            const data = await response.json()

            setActors(data.results || [])
        } catch (error) {
            console.error(error)
            setError('Unable to search for actors')
        }
    }*/

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

    /*const searchActors = async () => { // Check that the search field is not empty 
        if (!actorQuery.trim()) { setError('Please enter an actor name') 
            return 
        } 
        
        try { setError('') 
            
            // Search actors through the backend 
            const response = await fetch( `http://localhost:3000/api/movies/actors/search?query=${encodeURIComponent(actorQuery)}` ) 
            // Check if the request was successful 
            if (!response.ok) { 
                throw new Error('Actor search failed') 
            } 
            const data = await response.json() 
            
            // Save search results to state 
            setActors(data.results || []) 
        } 
        catch (error) { console.error(error) 
            setError('Unable to search for actors') 
        } 
    }*/

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