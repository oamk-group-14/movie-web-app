import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard'
import MediaGrid from '../components/MediaGrid';


function Movies() {
    const [query, setQuery] = useState('')
    const [movies, setMovies] = useState([])
    const [actors, setActors] = useState([])
    const [genres, setGenres] = useState([])
    const [showGenres, setShowGenres] = useState(false)
    const [selectedGenre, setSelectedGenre] = useState(null)
    const [favoriteIds, setFavoriteIds] = useState([])
    const [error, setError] = useState('')
    

    // Load available movie genres when the page is opened
    useEffect(() => {
        const loadGenres = async () => {
            try {
                const response = await fetch(
                    'http://localhost:3000/api/movies/genres'
                )

                const data = await response.json()
                setGenres(data)
            } catch (error) {
                console.error(error)
            }
        }

        loadGenres()
    }, [])

    // Add or remove a movie from the favorites list
    const toggleFavorite = (id) => {
        setFavoriteIds((currentFavorites) => {
            if (currentFavorites.includes(id)) {
                return currentFavorites.filter((favoriteId) => favoriteId !== id)
            }

            return [...currentFavorites, id]
        })
    }

    // Search for movies and actors using the entered search query
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

    // Search for movies belonging to the selected genre
    const searchByGenre = async (genreId) => {
        try {
            setError('')

            const response = await fetch(
                `http://localhost:3000/api/movies/genre/${genreId}`
            )

            if (!response.ok) {
                throw new Error('Genre search failed')
            }

            const data = await response.json()

            setMovies(data)
            setSelectedGenre(genreId)
        } catch (error) {
            console.error(error)
            setError('Unable to search by genre')
        }
    }

    return (
        <div className="media-page">
            <h1>Movies</h1>

            <div className="media-search">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                
                <button onClick={search}>
                    Search
                </button>
                
                <button className={`genre-button ${showGenres ? 'active' : ''}`} onClick={() => setShowGenres(!showGenres)}>
                    Genres
                </button>
            </div>

            {/* Show the genre buttons when the genre menu is opened */}
            {showGenres && (
                <div className="genre-list">
                    {genres.map((genre) => (
                        <button
                            className={selectedGenre === genre.id ? 'active' : ''}
                            onClick={() => searchByGenre(genre.id)}
                        >
                            {genre.name}
                        </button>
                    ))}
                </div>
            )}

            {error && <p>{error}</p>}

            <MediaGrid>
                {/* Display movies found through actor searches */}
                {actors.map((movie) => (
                    <MediaCard
                        key={movie.id}
                        id={movie.id}
                        title={movie.title}
                        posterUrl={
                            movie.poster_path
                                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                : null
                        }
                        date={movie.release_date}
                        rating={movie.vote_average}
                        type="movie"
                        isFavorite={favoriteIds.includes(movie.id)}
                        onFavoriteToggle={() => toggleFavorite(movie.id)}
                    />
                ))}

                {/* Display movies found through movie title or genre searches */}
                {movies.map((movie) => (
                    <MediaCard
                        key={movie.id}
                        id={movie.id}
                        title={movie.title}
                        posterUrl={
                            movie.poster_path
                                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                : null
                        }
                        date={movie.release_date}
                        rating={movie.vote_average}
                        type="movie"
                        isFavorite={favoriteIds.includes(movie.id)}
                        onFavoriteToggle={() => toggleFavorite(movie.id)}
                    />
                ))}
            </MediaGrid>
        </div>
    )
}

export default Movies;