import { useState, useEffect, useRef } from 'react';
import { useLogin } from '../context/LoginContext'
import MediaCard from '../components/MediaCard';
import MediaGrid from '../components/MediaGrid';

function TVShows() {
    const { user, token, loading: authLoading } = useLogin()

    const [query, setQuery] = useState('')
    const [tvshows, setTvShows] = useState([])
    const [actors, setActors] = useState([])
    const [tvShowPage, setTvShowPage] = useState(1)
    const [totalTvShowPages, setTotalTvShowPages] = useState(1)
    const [tvShowLoading, setTvShowLoading] = useState(false)
    const [genres, setGenres] = useState([])
    const [showGenres, setShowGenres] = useState(false)
    const [selectedGenre, setSelectedGenre] = useState(null)
    const [favoriteIds, setFavoriteIds] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [recommendationLoading, setRecommendationLoading] = useState(true)
    const [recommendationError, setRecommendationError] = useState('')
    const [error, setError] = useState('')

    // Prevent duplicate recommendation requests
    const recommendationRequestStarted = useRef(false)

    // Reference to the element used to trigger infinite scroll
    const loadMoreRef = useRef(null)

    // Prevent multiple TV show requests from running at the same time
    const tvShowRequestStarted = useRef(false)

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

            // Reset pagination when starting a new text search
            setSelectedGenre(null)
            setTvShows([])
            setActors([])
            setTvShowPage(1)
            setTotalTvShowPages(1)

            const actorResponse = await fetch(
                `http://localhost:3000/api/tvshows/actors/search?query=${encodeURIComponent(query)}`
            )

            const tvshowResponse = await fetch(
                `http://localhost:3000/api/tvshows/search?query=${encodeURIComponent(query)}&page=1`
            )

            if (!tvshowResponse.ok || !actorResponse.ok) {
                throw new Error('Search failed')
            }

            const actorData = await actorResponse.json()
            const tvshowData = await tvshowResponse.json()

            // Show the first page of TV show
            setActors(actorData.results || [])
            setTvShows(tvshowData.results || [])

            // Remember that page 1 is currently displayed
            setTvShowPage(tvshowData.page || 1)
            setTotalTvShowPages(tvshowData.totalPages || 1)

        } catch (error) {
            console.error(error)
            setError('Unable to search')
        }
    }

    // Load the next page of TV show search results
    const loadMoreTvShows = async () => {
        const isGenreSearch = selectedGenre !== null

        // Continue if either a text search or a genre search is active
        if (!query.trim() && !isGenreSearch) return

        // Prevent another request from starting before the previous finishes
        if (tvShowRequestStarted.current) return

        // Stop loading when all available pages have already been loaded
        if (tvShowPage >= totalTvShowPages) return

        try {
            tvShowRequestStarted.current = true
            setTvShowLoading(true)

            // Add 1 to the current page number to get the next page
            const nextPage = tvShowPage + 1

            // Use the active search type to request the next page
            const url = isGenreSearch
                ? `http://localhost:3000/api/tvshows/genre/${selectedGenre}?page=${nextPage}`
                : `http://localhost:3000/api/tvshows/search?query=${encodeURIComponent(query)}&page=${nextPage}`

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Could not load more TV shows')
            }

            const data = await response.json()

            // Keep the old TV shows and add the new results after them
            setTvShows((currentShows) => [
                ...currentShows,
                ...(data.results || [])
            ])

            // Save the new page number for the next request
            setTvShowPage(data.page || nextPage)

            // Save the total number of pages available from TMDB
            setTotalTvShowPages(data.totalPages || totalTvShowPages)

        } catch (error) {
            console.error(error)
        } finally {
            // Allow another request after the current request has finished
            tvShowRequestStarted.current = false
            setTvShowLoading(false)
        }
    }

    // When the user gets close to bottom of search results, load the next page
    useEffect(() => {
        const element = loadMoreRef.current

        // Stop if the bottom element does not exist yet
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                // Load more TV shows when the bottom element becomes visible
                if (entries[0].isIntersecting) {
                    loadMoreTvShows()
                }
            },
            {
                // Start loading before the user reaches the very bottom
                rootMargin: '300px'
            }
        )

        observer.observe(element)

        // Stop watching the element when the effect is removed
        return () => observer.disconnect()

    }, [query, selectedGenre, tvShowPage, totalTvShowPages])

    // Search for TV shows belonging to the selected genre
    const searchByGenre = async (genreId) => {
        try {
            setError('')
            setTvShows([])
            setActors([])
            setTvShowPage(1)
            setTotalTvShowPages(1)
            setSelectedGenre(genreId)
            // Clear the text search so infinite scroll does not load search results
            setQuery('')

            // Request the first page of the selected genre
            const response = await fetch(
                `http://localhost:3000/api/tvshows/genre/${genreId}?page=1`
            )

            if (!response.ok) {
                throw new Error('Genre search failed')
            }

            const data = await response.json()

            setTvShows(data.results || [])
            setTvShowPage(data.page || 1)
            setTotalTvShowPages(data.totalPages || 1)

        } catch (error) {
            console.error(error)
            setError('Unable to search by genre')
        }
    }

    // Load personalized recommendations for logged-in users
    useEffect(() => {
        // Wait until the login state has been checked
        if (authLoading) return

        // Clear recommendations when the user is logged out
        if (!user || !token) {
            setRecommendations([])
            setRecommendationLoading(false)
            setRecommendationError('')
            recommendationRequestStarted.current = false
            return
        }

        // Prevent duplicate recommendation requests
        if (recommendationRequestStarted.current) return

        recommendationRequestStarted.current = true

        const loadRecommendations = async () => {
                try {
                    setRecommendationLoading(true)
                    setRecommendationError('')

                    // Send the login token to authenticate the request
                    const response = await fetch(
                        'http://localhost:3000/api/recommendations/tvshows',
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )

                    if (!response.ok) {
                        throw new Error('Recommendation request failed')
                    }

                    const data = await response.json()

                    // Fetch details for all recommended TV shows
                    const recommendationDetails = await Promise.all(
                        (data.recommendations || []).map(
                            async (recommendation) => {
                                const tvShowResponse = await fetch(
                                    `http://localhost:3000/api/tvshows/${recommendation.id}`
                                )

                                // Skip TV shows whose details could not be loaded
                                if (!tvShowResponse.ok) return null

                                return await tvShowResponse.json()
                            }
                        )
                    )

                    // Save the TV show details and remove failed results
                    setRecommendations(recommendationDetails.filter(Boolean))
                } catch (error) {
                    console.error('Recommendation loading failed:', error)
                    setRecommendationError('Unable to load recommendations')
                } finally {
                    // Stop the recommendation loading
                    setRecommendationLoading(false)
                }
            }
            loadRecommendations()
        }, [user, token, authLoading])

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

                <button
                    className={`genre-button ${showGenres ? 'active' : ''}`}
                    onClick={() => setShowGenres(!showGenres)}
                >
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

            {/* Show recommendations only to logged-in users when no search is active */}
            {!authLoading && user && token && !query.trim() && selectedGenre === null && (
            <section className="recommendations-section">
                <h2>Recommended for you</h2>

                {recommendationLoading && (
                    <p>Loading recommendations...</p>
                )}

                {recommendationError && (
                    <p>{recommendationError}</p>
                )}

                {!recommendationLoading &&
                    !recommendationError &&
                    recommendations.length === 0 && (
                        <p>No recommendations available.</p>
                    )}

                {!recommendationLoading &&
                    recommendations.length > 0 && (
                        <MediaGrid>
                            {recommendations.map((show) => (
                                <MediaCard
                                    key={show.id}
                                    id={show.id}
                                    title={show.name}
                                    posterUrl={
                                        show.poster_path
                                            ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                                            : null
                                    }
                                    date={show.first_air_date}
                                    rating={show.vote_average}
                                    type="tv"
                                    isFavorite={favoriteIds.includes(show.id)}
                                    onFavoriteToggle={() => toggleFavorite(show.id)}
                                />
                            ))}
                        </MediaGrid>
                    )}
            </section>
            )}

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
                        isFavorite={favoriteIds.includes(tvshow.id)}
                        onFavoriteToggle={() => toggleFavorite(tvshow.id)}
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
                        isFavorite={favoriteIds.includes(tvshow.id)}
                        onFavoriteToggle={() => toggleFavorite(tvshow.id)}
                    />
                ))}
            </MediaGrid>

            {/* When IntersectionObserver becomes visible, the next TV show page is loaded */}
            {(query.trim() || selectedGenre !== null) &&
                tvShowPage < totalTvShowPages && (
                    <div ref={loadMoreRef}>
                        {tvShowLoading && <p>Loading more TV shows...</p>}
                    </div>
                )}
        </div>
    )
}

export default TVShows
