import { useState, useEffect, useRef, useCallback } from 'react';
import { useLogin } from '../context/LoginContext';
import MediaCard from '../components/MediaCard';
import MediaGrid from '../components/MediaGrid';
import AddToGroup from '../components/AddToGroup';
import useMyGroups from '../hooks/useMyGroups';

const API = 'http://localhost:3000/api';

function Movies() {
    const { user, token, loading: authLoading } = useLogin();
    const myGroups = useMyGroups();

    // Store the search query and movie results
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [moviePage, setMoviePage] = useState(1);
    const [totalMoviePages, setTotalMoviePages] = useState(1);
    const [movieLoading, setMovieLoading] = useState(false);

    // Store genre and actor search data
    const [actors, setActors] = useState([]);
    const [genres, setGenres] = useState([]);
    const [showGenres, setShowGenres] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);

    // Store favorite movie IDs and personalized recommendations
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationLoading, setRecommendationLoading] = useState(true);
    const [recommendationError, setRecommendationError] = useState('');
    const [error, setError] = useState('');

    // Keep references for infinite scrolling and duplicate request prevention
    const loadMoreRef = useRef(null);
    const movieRequestStarted = useRef(false);

    // Fetch available movie genres when the page loads
    useEffect(() => {
        let cancelled = false;

        async function loadGenres() {
            try {
                const response = await fetch(`${API}/movies/genres`);

                if (!response.ok) {
                    throw new Error('Genre fetch failed');
                }

                const data = await response.json();

                // Update state only while this effect is active
                if (!cancelled) {
                    setGenres(Array.isArray(data) ? data : data.genres || []);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Genre loading failed:', err);
                }
            }
        }

        loadGenres();

        // Prevent state updates if the component unmounts
        return () => {
            cancelled = true;
        };
    }, []);

    // Load the logged-in user's favorites.
    useEffect(() => {
        let cancelled = false;

        async function loadFavorites() {
            const authToken = token || localStorage.getItem('token');

            if (!authToken) {
                setFavoriteIds([]);
                return;
            }

            try {
                const response = await fetch(`${API}/favorites`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Unable to load favorites');
                }

                const data = await response.json();

                const ids = (data.favorites || [])
                    .filter((favorite) => favorite.media_type === 'movie')
                    .map((favorite) => Number(favorite.movie_id))
                    .filter(Number.isFinite);

                if (!cancelled) {
                    setFavoriteIds(ids);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Error loading favorites:', err);
                }
            }
        }

        loadFavorites();

        return () => {
            cancelled = true;
        };
    }, [token]);

    // Add a movie to favorites or remove it from the user's favorites
    const toggleFavorite = async (movie) => {
        const authToken = token || localStorage.getItem('token');

        // Require authentication before changing favorites
        if (!authToken) {
            setError('Please log in to manage favorites.');
            return;
        }

        // Check that the movie has a valid ID
        if (!movie || movie.id == null) {
            setError('Unable to identify this movie.');
            return;
        }

        const id = Number(movie.id);
        const isFavorite = favoriteIds.includes(id);

        try {
            setError('');

            const response = await fetch(
                isFavorite
                    ? `${API}/favorites/movie/${id}`
                    : `${API}/favorites`,
                {
                    method: isFavorite ? 'DELETE' : 'POST',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    ...(!isFavorite && {
                        body: JSON.stringify({
                            mediaId: id,
                            mediaType: 'movie',
                            title: movie.title,
                            posterPath: movie.poster_path ?? null,
                            releaseYear: movie.release_date
                                ? movie.release_date.slice(0, 4)
                                : null,
                            voteAverage: movie.vote_average ?? null,
                        }),
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.error || 'Unable to update favorites'
                );
            }

            // Update the favorite IDs after the backend confirms the change
            setFavoriteIds((current) => {
                if (isFavorite) {
                    return current.filter((favoriteId) => favoriteId !== id);
                }

                return current.includes(id) ? current : [...current, id];
            });
        } catch (err) {
            console.error('Error updating favorites:', err);
            setError(err.message || 'Unable to update favorites');
        }
    };

    // Search for movies by title and actors by name
    const search = async () => {
        const searchQuery = query.trim();

        if (!searchQuery) {
            setError('Please enter a movie title or actor name');
            return;
        }

        // Clear the previous search results and reset the movie list so the new search starts from the first page
        setError('');
        setSelectedGenre(null);
        setMovies([]);
        setActors([]);
        setMoviePage(1);
        setTotalMoviePages(1);
        movieRequestStarted.current = false;

        try {
            // Fetch movie and actor results at the same time
            const [actorResponse, movieResponse] = await Promise.all([
                fetch(
                    `${API}/movies/actors/search?query=${encodeURIComponent(searchQuery)}`
                ),
                fetch(
                    `${API}/movies/search?query=${encodeURIComponent(searchQuery)}&page=1`
                ),
            ]);

            if (!actorResponse.ok || !movieResponse.ok) {
                throw new Error('Search failed');
            }

            const [actorData, movieData] = await Promise.all([
                actorResponse.json(),
                movieResponse.json(),
            ]);

            // Save the actors and movies returned by the search and track which page is displayed and how many pages are available
            setActors(actorData.results || []);
            setMovies(movieData.results || []);
            setMoviePage(movieData.page || 1);
            setTotalMoviePages(movieData.totalPages || 1);
        } catch (err) {
            console.error('Movie search failed:', err);
            setError('Unable to search');
        }
    };

    // Find movies belonging to a selected genre
    const searchByGenre = async (genreId) => {
        // Reset the current search before loading genre results
        setError('');
        setMovies([]);
        setActors([]);
        setQuery('');
        setSelectedGenre(genreId);
        setMoviePage(1);
        setTotalMoviePages(1);
        movieRequestStarted.current = false;

        try {
            const response = await fetch(
                `${API}/movies/genre/${genreId}?page=1`
            );

            if (!response.ok) {
                throw new Error('Genre search failed');
            }

            const data = await response.json();

            // Save the movies found in the selected genre and track the current page and the total number of pages
            setMovies(data.results || []);
            setMoviePage(data.page || 1);
            setTotalMoviePages(data.totalPages || 1);
        } catch (err) {
            console.error('Genre search failed:', err);
            setError('Unable to search by genre');
        }
    };

    // Load the next page of results without adding duplicate movies
    const loadMoreMovies = useCallback(async () => {
        const isGenreSearch = selectedGenre !== null;

        // Stop when there is no active search or another request is running
        if (!query.trim() && !isGenreSearch) return;
        if (movieRequestStarted.current || movieLoading) return;
        if (moviePage >= totalMoviePages) return;

        movieRequestStarted.current = true;
        setMovieLoading(true);

        const nextPage = moviePage + 1;

        try {
            // Choose the correct endpoint for the current search type
            const url = isGenreSearch
                ? `${API}/movies/genre/${selectedGenre}?page=${nextPage}`
                : `${API}/movies/search?query=${encodeURIComponent(query.trim())}&page=${nextPage}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Could not load more movies');
            }

            const data = await response.json();

            // Append only movies that are not already in the results
            setMovies((current) => {
                const existingIds = new Set(
                    current.map((movie) => movie.id)
                );

                const newMovies = (data.results || []).filter(
                    (movie) => !existingIds.has(movie.id)
                );

                return [...current, ...newMovies];
            });

            // Update the current page and the total number of pages after loading more movies
            setMoviePage(data.page || nextPage);
            setTotalMoviePages(data.totalPages || totalMoviePages);
        } catch (err) {
            console.error('Loading more movies failed:', err);
            setError('Could not load more movies');
        } finally {
            // Allow another request after the current one finishes
            movieRequestStarted.current = false;
            setMovieLoading(false);
        }
    }, [
        query,
        selectedGenre,
        moviePage,
        totalMoviePages,
        movieLoading,
    ]);

    // Automatically request more results when the user approaches the bottom
    useEffect(() => {
        const element = loadMoreRef.current;

        // Observe the page only when more search results are available
        if (!element) return;
        if (!query.trim() && selectedGenre === null) return;
        if (moviePage >= totalMoviePages) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadMoreMovies();
                }
            },
            { rootMargin: '300px' }
        );

        observer.observe(element);

        // Stop observing when the search changes or the component unmounts
        return () => observer.disconnect();
    }, [
        loadMoreMovies,
        query,
        selectedGenre,
        moviePage,
        totalMoviePages,
    ]);

    // Load personalized movie recommendations for the logged-in user
    useEffect(() => {
        let cancelled = false;

        async function loadRecommendations() {
            // Wait until the authentication state has been determined
            if (authLoading) return;

            const authToken = token || localStorage.getItem('token');

            // Recommendations are available only to logged-in users
            if (!user || !authToken) {
                setRecommendations([]);
                setRecommendationLoading(false);
                setRecommendationError('');
                return;
            }

            setRecommendationLoading(true);
            setRecommendationError('');

            try {
                const response = await fetch(
                    `${API}/recommendations/movies`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Recommendation request failed');
                }

                const data = await response.json();

                // Fetch full movie details for every recommended movie ID
                const details = await Promise.all(
                    (data.recommendations || []).map(async (recommendation) => {
                        try {
                            const movieResponse = await fetch(
                                `${API}/movies/${recommendation.id}`
                            );

                            if (!movieResponse.ok) return null;

                            return await movieResponse.json();
                        } catch (err) {
                            console.error(
                                'Could not load recommended movie:',
                                err
                            );
                            return null;
                        }
                    })
                );

                // Ignore results if this effect has already been cancelled
                if (!cancelled) {
                    setRecommendations(details.filter(Boolean));
                }
            } catch (err) {
                console.error('Recommendation loading failed:', err);

                if (!cancelled) {
                    setRecommendations([]);
                    setRecommendationError(
                        'Unable to load recommendations'
                    );
                }
            } finally {
                if (!cancelled) {
                    setRecommendationLoading(false);
                }
            }
        }

        loadRecommendations();

        // Prevent outdated requests from updating the component
        return () => {
            cancelled = true;
        };
    }, [user, token, authLoading]);

    // Reuse the same movie card layout for search results and recommendations
    const renderMovieCard = (movie) => (
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
            isFavorite={favoriteIds.includes(Number(movie.id))}
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
    );

    // Show recommendations only on the default page for logged in users
    const showRecommendations =
        !authLoading &&
        user &&
        (token || localStorage.getItem('token')) &&
        !query.trim() &&
        selectedGenre === null;

    return (
        <div className="media-page">
            <h1>Movies</h1>

            <div className="media-search">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            search();
                        }
                    }}
                />

                <button onClick={search}>
                    Search
                </button>

                <button
                    className={`genre-button ${showGenres ? 'active' : ''}`}
                    onClick={() => setShowGenres((current) => !current)}
                >
                    Genres
                </button>
            </div>

            {/* Display genre filters when the genre menu is open */}
            {showGenres && (
                <div className="genre-list">
                    {genres.map((genre) => (
                        <button
                            key={genre.id}
                            className={
                                selectedGenre === genre.id ? 'active' : ''
                            }
                            onClick={() => searchByGenre(genre.id)}
                        >
                            {genre.name}
                        </button>
                    ))}
                </div>
            )}

            {error && <p role="alert">{error}</p>}

            {/* Show personalized recommendations on the default movie page */}
            {showRecommendations && (
                <section className="recommendations-section">
                    <h2>Recommended for you</h2>

                    {recommendationLoading && (
                        <p>Loading recommendations...</p>
                    )}

                    {recommendationError && (
                        <p role="alert">{recommendationError}</p>
                    )}

                    {!recommendationLoading &&
                        !recommendationError &&
                        recommendations.length === 0 && (
                            <p>No recommendations available.</p>
                        )}

                    {!recommendationLoading &&
                        recommendations.length > 0 && (
                            <MediaGrid>
                                {recommendations.map(renderMovieCard)}
                            </MediaGrid>
                        )}
                </section>
            )}

            {/* Display actor and movie search results in the same grid */}
            <MediaGrid>
                {actors.map(renderMovieCard)}
                {movies.map(renderMovieCard)}
            </MediaGrid>

            {/* Detect when the user reaches the end of the movie list so more movies can be loaded */}
            {(query.trim() || selectedGenre !== null) &&
                moviePage < totalMoviePages && (
                    <div ref={loadMoreRef}>
                        {movieLoading && <p>Loading more movies...</p>}
                    </div>
                )}
        </div>
    );
}

export default Movies;