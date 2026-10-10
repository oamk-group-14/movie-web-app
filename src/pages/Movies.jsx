import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard'
import MediaGrid from '../components/MediaGrid';
import AddToGroup from '../components/AddToGroup';
import useMyGroups from '../hooks/useMyGroups';


function Movies() {
    const [query, setQuery] = useState('')
    const [movies, setMovies] = useState([])
    const [actors, setActors] = useState([])
    const [genres, setGenres] = useState([])
    const [showGenres, setShowGenres] = useState(false)
    const [selectedGenre, setSelectedGenre] = useState(null)
    const [favoriteIds, setFavoriteIds] = useState([])
    const [error, setError] = useState('')
    const myGroups = useMyGroups()


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

    // Load the logged-in user's favorites
    useEffect(() => {
        const loadFavorites = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                setFavoriteIds([])
                return
            }

            try {
                const response = await fetch(
                    'http://localhost:3000/api/favorites',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (!response.ok) {
                    throw new Error('Unable to load favorites')
                }

                const data = await response.json()
                const favorites = data.favorites || []

                // Only show movie favorites on the Movies page.
                const movieIds = favorites
                    .filter(favorite =>
                        (favorite.media_type === 'movie')
                    )
                    .map(favorite =>
                        Number(favorite.movie_id)
                    )
                    .filter(id => Number.isFinite(id))

                setFavoriteIds(movieIds)
            } catch (error) {
                console.error('Error loading favorites:', error)
            }
        }

        loadFavorites()
    }, [])

    // Add or remove a movie through the backend
    const toggleFavorite = async (movie) => {
        const token = localStorage.getItem('token')

        if (!token) {
            setError('Please log in to manage favorites.')
            return
        }

        const isFavorite = favoriteIds.includes(movie.id)

        try {
            setError('')

            const response = await fetch(
                isFavorite
                    ? `http://localhost:3000/api/favorites/movie/${movie.id}`
                    : 'http://localhost:3000/api/favorites',
                {
                    method: isFavorite ? 'DELETE' : 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    ...(!isFavorite && {
                        body: JSON.stringify({
                            mediaId: movie.id,
                            mediaType: 'movie',
                            title: movie.title,
                            posterPath: movie.poster_path ?? null,
                            releaseYear: movie.release_date
                                ? movie.release_date.slice(0, 4)
                                : null,
                            voteAverage: movie.vote_average ?? null
                        })
                    })
                }
            )

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(
                    data.error || 'Unable to update favorites'
                )
            }

            // Update the heart only after the server confirms success.
            setFavoriteIds(currentFavorites => {
                if (isFavorite) {
                    return currentFavorites.filter(
                        id => id !== movie.id
                    )
                }

                return currentFavorites.includes(movie.id)
                    ? currentFavorites
                    : [...currentFavorites, movie.id]
            })
        } catch (error) {
            console.error('Error updating favorites:', error)
            setError(error.message || 'Unable to update favorites')
        }
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
                        onFavoriteToggle={() => toggleFavorite(movie)}

                        action={
                            <AddToGroup
                                groups={myGroups}
                                movieId={movie.id}
                                mediaType="movie"
                                title={movie.title}
                                posterPath={movie.poster_path}
                            />
                        }
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
                        onFavoriteToggle={() => toggleFavorite(movie)}

                        action={
                            <AddToGroup
                                groups={myGroups}
                                movieId={movie.id}
                                mediaType="movie"
                                title={movie.title}
                                posterPath={movie.poster_path}
                            />
                        }
                    />
                ))}
            </MediaGrid>
        </div>
    )
}

export default Movies;