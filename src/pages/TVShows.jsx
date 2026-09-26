import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard';
import MediaGrid from '../components/MediaGrid';

function TVShows() {
    const [query, setQuery] = useState('')
    const [tvshows, setTvShows] = useState([])
    const [actors, setActors] = useState([])
    const [genres, setGenres] = useState([]) 
    const [showGenres, setShowGenres] = useState(false)
    const [favoriteIds, setFavoriteIds] = useState([])
    const [error, setError] = useState('')

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

    // Add or remove a TV show from the temporary favorites list
    const toggleFavorite = (id) => {
        setFavoriteIds((currentFavorites) => {
            if (currentFavorites.includes(id)) {
                return currentFavorites.filter((favoriteId) => favoriteId !== id)
            }

            return [...currentFavorites, id]
        })
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
                        key={tvshow.id}
                        id={tvshow.id}
                        title={tvshow.title}
                        posterUrl={
                            tvshow.poster_path
                                ? `https://image.tmdb.org/t/p/w300${tvshow.poster_path}`
                                : null
                        }
                        date={tvshow.release_date}
                        rating={tvshow.vote_average}
                        type="tv"
                        isFavorite={favoriteIds.includes(movie.id)}
                        onFavoriteToggle={() => toggleFavorite(movie.id)}
                    />
                ))}

                {/* Display TV shows found through title or genre searches */}
                {tvshows.map((tvshow) => (
                    <MediaCard
                        key={tvshow.id}
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
                        isFavorite={favoriteIds.includes(movie.id)}
                        onFavoriteToggle={() => toggleFavorite(movie.id)}   
                    />
                ))}
            </MediaGrid>
        </div>
    )
}

export default TVShows