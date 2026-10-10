import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard';
import MediaGrid from '../components/MediaGrid';
import AddToGroup from '../components/AddToGroup';
import useMyGroups from '../hooks/useMyGroups';

function TVShows() {
    const [query, setQuery] = useState('')
    const [tvshows, setTvShows] = useState([])
    const [actors, setActors] = useState([])
    const [genres, setGenres] = useState([])
    const [showGenres, setShowGenres] = useState(false)
    const [favoriteIds, setFavoriteIds] = useState([])
    const [error, setError] = useState('')
    const myGroups = useMyGroups()

    // Load available TV show genres when the page is opened
    useEffect(() => {
        const loadGenres = async () => {
            try {
                const response = await fetch(
                    'http://localhost:3000/api/tvshows/genres'
                )

                if (!response.ok) {
                    throw new Error('Genre fetch failed')
                }

                const data = await response.json()
                setGenres(data)
            } catch (error) {
                console.error(error)
            }
        }

        loadGenres()
    }, [])

    // Load the logged-in user's saved TV show favorites
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

            // Only show TV show favorites on this page.
            const tvIds = favorites
                .filter(favorite => favorite.media_type === 'tv')
                .map(favorite => Number(favorite.movie_id))
                .filter(id => Number.isFinite(id))

            setFavoriteIds(tvIds)
        } catch (error) {
            console.error('Error loading favorites:', error)
        }
    }

    loadFavorites()
}, [])

    // Add or remove a TV show through the backend
    const toggleFavorite = async (tvshow) => {
        const token = localStorage.getItem('token')

        if (!token) {
            setError('Please log in to manage favorites.')
            return
        }

        const isFavorite = favoriteIds.includes(tvshow.id)

        try {
            setError('')

            const response = await fetch(
                isFavorite
                    ? `http://localhost:3000/api/favorites/tv/${tvshow.id}`
                    : 'http://localhost:3000/api/favorites',
                {
                    method: isFavorite ? 'DELETE' : 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    ...(!isFavorite && {
                        body: JSON.stringify({
                            mediaId: tvshow.id,
                            mediaType: 'tv',
                            title: tvshow.name,
                            posterPath: tvshow.poster_path ?? null,
                            releaseYear: tvshow.first_air_date
                                ? tvshow.first_air_date.slice(0, 4)
                                : null,
                            voteAverage: tvshow.vote_average ?? null
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

            // Update the heart after the backend confirms success.
            setFavoriteIds(currentFavorites => {
                if (isFavorite) {
                    return currentFavorites.filter(
                        id => id !== tvshow.id
                    )
                }

                return currentFavorites.includes(tvshow.id)
                    ? currentFavorites
                    : [...currentFavorites, tvshow.id]
            })
        } catch (error) {
            console.error('Error updating favorites:', error)
            setError(error.message || 'Unable to update favorites')
        }
    }

    // Search for TV shows and actors using the entered search query
    const searchTvShows = async () => {
        if (!query.trim()) {
            setError('Please enter a show title or actor name')
            return
        }

        try {
            setError('')

            const actorResponse = await fetch(
                `http://localhost:3000/api/tvshows/actors/search?query=${encodeURIComponent(query)}`
            )

            const tvshowResponse = await fetch(
                `http://localhost:3000/api/tvshows/search?query=${encodeURIComponent(query)}`
            )

            if (!tvshowResponse.ok || !actorResponse.ok) {
                throw new Error('Search failed')
            }

            const actorData = await actorResponse.json()
            const tvshowData = await tvshowResponse.json()

            setActors(actorData.results || [])
            setTvShows(tvshowData.results || [])


        } catch (error) {
            console.error(error)
            setError('Unable to search')
        }
    }

    // Search for TV shows belonging to the selected genre
    const searchByGenre = async (genreId) => {
        try {
            setError('')

            const response = await fetch(
                `http://localhost:3000/api/tvshows/genre/${genreId}`
            )

            if (!response.ok) {
                throw new Error('Genre search failed')
            }

            const data = await response.json()

            setTvShows(data)
            setActors([])
        } catch (error) {
            console.error(error)
            setError('Unable to search by genre')
        }
    }

    return (
        <div className="media-page">
            <h1>TV shows</h1>

            <div className="media-search">
                <input
                    type="text"
                    placeholder="Search tv shows..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />

                <button onClick={searchTvShows}>
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
                            key={genre.id}
                            onClick={() => searchByGenre(genre.id)}
                        >
                            {genre.name}
                        </button>
                    ))}
                </div>
            )}

            {error && <p>{error}</p>}

            <MediaGrid>
                {/* Display TV shows found through actor searches */}
                {actors.map((tvshow) => (
                    <MediaCard
                        key={`actor-${tvshow.id}`}
                        id={tvshow.id}
                        title={tvshow.name}
                        posterUrl={
                            tvshow.poster_path
                                ? `https://image.tmdb.org/t/p/w300${tvshow.poster_path}`
                                : null
                        }
                        date={tvshow.first_air_date}
                        rating={tvshow.vote_average}
                        type="tv"
                        isFavorite={favoriteIds.includes(tvshow.id)}
                        onFavoriteToggle={() => toggleFavorite(tvshow)}

                        action={
                            <AddToGroup
                                groups={myGroups}
                                movieId={tvshow.id}
                                mediaType="tv"
                                title={tvshow.name}
                                posterPath={tvshow.poster_path}
                            />
                        }
                    />
                ))}

                {/* Display TV shows found through title or genre searches */}
                {tvshows.map((tvshow) => (
                    <MediaCard
                        key={`tvshow-${tvshow.id}`}
                        id={tvshow.id}
                        title={tvshow.name}
                        posterUrl={
                            tvshow.poster_path
                                ? `https://image.tmdb.org/t/p/w300${tvshow.poster_path}`
                                : null
                        }
                        date={tvshow.first_air_date}
                        rating={tvshow.vote_average}
                        type="tv"
                        isFavorite={favoriteIds.includes(tvshow.id)}
                        onFavoriteToggle={() => toggleFavorite(tvshow)}

                        action={
                            <AddToGroup
                                groups={myGroups}
                                movieId={tvshow.id}
                                mediaType="tv"
                                title={tvshow.name}
                                posterPath={tvshow.poster_path}
                            />
                        }
                    />
                ))}
            </MediaGrid>
        </div>
    )
}

export default TVShows