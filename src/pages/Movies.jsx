import { useState, useEffect, useRef } from 'react';
import { useLogin } from '../context/LoginContext'
import MediaCard from '../components/MediaCard'
import MediaGrid from '../components/MediaGrid';

function Movies() {
    // Get the current user, login token, and authentication loading state
    const { user, token, loading: authLoading } = useLogin()

    // Store movie search results, page numbers, loading states, 
    // genres, favorites, AI recommendations, and errors
    const [query, setQuery] = useState('')
    const [movies, setMovies] = useState([])
    const [moviePage, setMoviePage] = useState(1)
    const [totalMoviePages, setTotalMoviePages] = useState(1)
    const [movieLoading, setMovieLoading] = useState(false)
    const [actors, setActors] = useState([])
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

    // Prevent multiple movie requests from running at the same time
    const movieRequestStarted = useRef(false)
    
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

    // Search for movies and actors using the search query
    const search = async () => {
        if (!query.trim()) {
            setError('Please enter a movie title or actor name')
            return
        }

        // Clear the selected genre and reset the page numbers for a new search
        setSelectedGenre(null)
        setMoviePage(1)
        setTotalMoviePages(1)

        try {
            setError('')

            const actorResponse = await fetch(
                `http://localhost:3000/api/movies/actors/search?query=${encodeURIComponent(query)}`
            )

            const movieResponse = await fetch(
                `http://localhost:3000/api/movies/search?query=${encodeURIComponent(query)}&page=1`
            )

            if (!movieResponse.ok || !actorResponse.ok) {
                throw new Error('Search failed')
            }

            const actorData = await actorResponse.json()
            const movieData = await movieResponse.json()
            
            // Display the first page of search results
            setActors(actorData.results || [])
            setMovies(movieData.results || [])

            // Save the current page and total number of pages for infinite scroll
            setMoviePage(movieData.page || 1)
            setTotalMoviePages(movieData.totalPages || 1)
            

        } catch (error) {
            console.error(error)
            setError('Unable to search')
        }
    }
 
    // Search for movies belonging to the selected genre
    const searchByGenre = async (genreId) => {
        try {
            // Clear previous results and reset the page numbers when starting a new search
            setMovies([])
            setActors([])
            setMoviePage(1)
            setTotalMoviePages(1)

            // Save the selected genre and clear the text search
            setSelectedGenre(genreId)
            setQuery('')

            const response = await fetch(
                `http://localhost:3000/api/movies/genre/${genreId}`
            )

            if (!response.ok) {
                throw new Error('Genre search failed')
            }

            const data = await response.json()

            // Display the first page and save the current page and total number of pages
            setMovies(data.results || [])
            setMoviePage(data.page || 1)
            setTotalMoviePages(data.totalPages || 1)

        } catch (error) {
            console.error(error)
            setError('Unable to search by genre')
        }
    }

    // Load the next page when more search results are available
    const loadMoreMovies = async () => {
        // Check whether the active search is a genre search
        const isGenreSearch = selectedGenre !== null

        // Continue only if a text search or genre search is active
        if (!query.trim() && !isGenreSearch) return

        // Stop if a request is running or there are no more pages
        if (movieRequestStarted.current) return
        if (moviePage >= totalMoviePages) return

        try {
            movieRequestStarted.current = true
            setMovieLoading(true)

            // Calculate the next page number
            const nextPage = moviePage + 1

            // Use the correct endpoint for the active search type
            const url = isGenreSearch
                ? `http://localhost:3000/api/movies/genre/${selectedGenre}?page=${nextPage}`
                : `http://localhost:3000/api/movies/search?query=${encodeURIComponent(query)}&page=${nextPage}`

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Could not load more movies')
            }

            const data = await response.json()

            // Add new movies without removing the existing results
            // This allows infinite scroll to make one continuous list for movies
            setMovies((currentMovies) => [
                ...currentMovies,
                ...(data.results || [])
            ])

            // Save the current page and the total number of pages
            setMoviePage(data.page || nextPage)
            setTotalMoviePages(data.totalPages || totalMoviePages)

        } catch (error) {
            console.error(error)
            setError('Could not load more movies')
        } finally {
            // Allow new requests and stop the loadig
            movieRequestStarted.current = false
            setMovieLoading(false)
        }
    }

    // Detect when the user gets close to the bottom of the results
    useEffect(() => {
        const element = loadMoreRef.current

        // Stop if the trigger element does not exist
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                // Load the next page when the trigger becomes visible
                if (entries[0].isIntersecting) {
                    loadMoreMovies()
                }
            },
            {
                // Start loading before the user reaches the bottom
                rootMargin: '300px'
            }
        )

        observer.observe(element)

        // Stop observing the element when the effect is cleaned up
        return () => observer.disconnect()

    }, [query, moviePage, totalMoviePages])

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
                        'http://localhost:3000/api/recommendations/movies',
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

                    // Fetch details for all recommended movies
                    const recommendationDetails = await Promise.all(
                        (data.recommendations || []).map(
                            async (recommendation) => {
                                const movieResponse = await fetch(
                                    `http://localhost:3000/api/movies/${recommendation.id}`
                                )

                                // Skip movies whose details could not be loaded
                                if (!movieResponse.ok) return null

                                return await movieResponse.json()
                            }
                        )
                    )

                    // Save the movie details and remove failed results
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

            {/* Show genre buttons when the genre menu is open */}
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

            {/* Movie recommendations only to logged-in users when no search is active */}
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
                                {recommendations.map((movie) => (
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
                                        isFavorite={favoriteIds.includes(
                                            movie.id
                                        )}
                                        onFavoriteToggle={() =>
                                            toggleFavorite(movie.id)
                                        }
                                    />
                                ))}
                            </MediaGrid>
                        )}
            </section>
        )}

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
            
            {/* Load the next page when the scroll trigger becomes visible */}
            {(query.trim() || selectedGenre !== null) &&
                moviePage < totalMoviePages && (
                    <div ref={loadMoreRef}>
                        {movieLoading && <p>Loading more movies...</p>}
                    </div>
                )}
        </div>
    )
}

export default Movies;