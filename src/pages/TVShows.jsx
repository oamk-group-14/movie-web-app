import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard';
import MediaGrid from '../components/MediaGrid';

function TVShows() {
    const [query, setQuery] = useState('')
    const [tvshows, setTvShows] = useState([])
    const [actors, setActors] = useState([])
    const [genres, setGenres] = useState([]) 
    const [showGenres, setShowGenres] = useState(false) 
    const [error, setError] = useState('')

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

    // Return TV show details to frontend
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

                <button className="genre-button" onClick={() => setShowGenres(!showGenres)}>
                    Genres
                </button>
            </div>

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
                    />
                ))}

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
                    />
                ))}
            </MediaGrid>
        </div>
    )
}

export default TVShows