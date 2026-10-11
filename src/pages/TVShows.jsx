import { useState, useEffect, useRef, useCallback } from 'react';
import { useLogin } from '../context/LoginContext';
import MediaCard from '../components/MediaCard';
import MediaGrid from '../components/MediaGrid';
import AddToGroup from '../components/AddToGroup';
import useMyGroups from '../hooks/useMyGroups';

const API = 'http://localhost:3000/api';

function TVShows() {
    const { user, token, loading: authLoading } = useLogin();
    const myGroups = useMyGroups();

    // Store the search text and the TV shows and actors found by the search
    const [query, setQuery] = useState('');
    const [tvshows, setTvShows] = useState([]);
    const [actors, setActors] = useState([]);
    const [tvShowPage, setTvShowPage] = useState(1);
    const [totalTvShowPages, setTotalTvShowPages] = useState(1);
    const [tvShowLoading, setTvShowLoading] = useState(false);

    // Store the available genres and control which genre is selected
    const [genres, setGenres] = useState([]);
    const [showGenres, setShowGenres] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);

    // Store the user's favorite TV shows and personalized recommendations
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationLoading, setRecommendationLoading] = useState(false);
    const [recommendationError, setRecommendationError] = useState('');
    const [error, setError] = useState('');

    // Keep track of the element used to detect when the user reaches the bottom of the list
    const loadMoreRef = useRef(null);

    // Prevent multiple requests from loading more TV shows at the same time
    const requestStarted = useRef(false);

    // Fetch the available TV genres when the page first loads
    useEffect(() => {
        let cancelled = false;

        async function loadGenres() {
            try {
                const response = await fetch(`${API}/tvshows/genres`);

                if (!response.ok) {
                    throw new Error('Could not load TV genres');
                }

                const data = await response.json();

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

        // Prevent state updates if the component is no longer active
        return () => {
            cancelled = true;
        };
    }, []);

    // Fetch the logged-in user's favorite TV shows from the backend
    useEffect(() => {
        let cancelled = false;

        async function loadFavorites() {
            if (!token) {
                setFavoriteIds([]);
                return;
            }

            try {
                const response = await fetch(`${API}/favorites`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Unable to load favorites');
                }

                const data = await response.json();
                const favorites = data.favorites || [];

                // Keep only TV show favorites and convert their IDs to numbers
                const ids = favorites
                    .filter((favorite) => favorite.media_type === 'tv')
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

        // Prevent state updates if the component is no longer active
        return () => {
            cancelled = true;
        };
    }, [token]);

    // Add a TV show to favorites or remove it if it is already saved
    const toggleFavorite = async (show) => {
        const authToken = token || localStorage.getItem('token');

        if (!authToken) {
            setError('Please log in to manage favorites.');
            return;
        }

        if (!show || show.id == null) {
            setError('Could not identify this TV show.');
            return;
        }

        const id = Number(show.id);
        const isFavorite = favoriteIds.includes(id);

        try {
            setError('');

            const response = await fetch(
                isFavorite
                    ? `${API}/favorites/tv/${id}`
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
                            mediaType: 'tv',
                            title: show.name || show.title || 'Unknown TV show',
                            posterPath: show.poster_path ?? null,
                            releaseYear: (
                                show.first_air_date || show.release_date
                            )?.slice(0, 4) || null,
                            voteAverage: show.vote_average ?? null,
                        }),
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Unable to update favorites');
            }

            // Update the favorite list immediately after a successful request
            setFavoriteIds((current) =>
                isFavorite
                    ? current.filter((favoriteId) => favoriteId !== id)
                    : current.includes(id)
                        ? current
                        : [...current, id]
            );
        } catch (err) {
            console.error('Error updating favorites:', err);
            setError(err.message || 'Unable to update favorites');
        }
    };

    // Search for TV shows by title or find TV shows related to an actor
    const searchTvShows = async () => {
        if (!query.trim()) {
            setError('Please enter a show title or actor name.');
            return;
        }

        const searchQuery = query.trim();

        // Clear previous results so the new search starts with a clean list
        setError('');
        setSelectedGenre(null);
        setTvShows([]);
        setActors([]);
        setTvShowPage(1);
        setTotalTvShowPages(1);

        try {
            // Search for actors and TV shows at the same time
            const [actorResponse, showResponse] = await Promise.all([
                fetch(
                    `${API}/tvshows/actors/search?query=${encodeURIComponent(searchQuery)}`
                ),
                fetch(
                    `${API}/tvshows/search?query=${encodeURIComponent(searchQuery)}&page=1`
                ),
            ]);

            if (!actorResponse.ok || !showResponse.ok) {
                throw new Error('Search failed');
            }

            const [actorData, showData] = await Promise.all([
                actorResponse.json(),
                showResponse.json(),
            ]);

            // Save the actors and TV shows returned by the search and track how many pages are available
            setActors(actorData.results || []);
            setTvShows(showData.results || []);
            setTvShowPage(showData.page || 1);
            setTotalTvShowPages(showData.totalPages || 1);
        } catch (err) {
            console.error('TV show search failed:', err);
            setError('Unable to search TV shows. Please try again.');
        }
    };

    // Find TV shows that belong to the selected genre
    const searchByGenre = async (genreId) => {
        setError('');
        setQuery('');
        setActors([]);
        setTvShows([]);
        setSelectedGenre(genreId);
        setTvShowPage(1);
        setTotalTvShowPages(1);
        requestStarted.current = false;

        try {
            const response = await fetch(
                `${API}/tvshows/genre/${genreId}?page=1`
            );

            if (!response.ok) {
                throw new Error('Genre search failed');
            }

            const data = await response.json();

            // Save the TV shows found in the selected genre and track how many pages are available
            setTvShows(data.results || []);
            setTvShowPage(data.page || 1);
            setTotalTvShowPages(data.totalPages || 1);
        } catch (err) {
            console.error('Genre search failed:', err);
            setError('Unable to load TV shows for this genre.');
        }
    };

    // Load more TV shows when the user reaches the end of the current list
    const loadMoreTvShows = useCallback(async () => {
        const isGenreSearch = selectedGenre !== null;
        const hasTextSearch = Boolean(query.trim());

        if (!hasTextSearch && !isGenreSearch) return;
        if (requestStarted.current || tvShowLoading) return;
        if (tvShowPage >= totalTvShowPages) return;

        requestStarted.current = true;
        setTvShowLoading(true);

        // Calculate which page of results should be requested next
        const nextPage = tvShowPage + 1;

        try {
            // Use the selected genre or search text to fetch the next set of TV shows
            const url = isGenreSearch
                ? `${API}/tvshows/genre/${selectedGenre}?page=${nextPage}`
                : `${API}/tvshows/search?query=${encodeURIComponent(query.trim())}&page=${nextPage}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Could not load more TV shows');
            }

            const data = await response.json();

            // Add the new TV shows without repeating ones already displayed
            setTvShows((current) => {
                const existingIds = new Set(current.map((show) => show.id));
                const newShows = (data.results || []).filter(
                    (show) => !existingIds.has(show.id)
                );

                return [...current, ...newShows];
            });

            // Update the current page and the total number of pages available
            setTvShowPage(data.page || nextPage);
            setTotalTvShowPages(data.totalPages || totalTvShowPages);
        } catch (err) {
            console.error('Loading more TV shows failed:', err);
            setError('Unable to load more TV shows.');
        } finally {
            // Allow another request and stop showing the loading indicator
            requestStarted.current = false;
            setTvShowLoading(false);
        }
    }, [
        query,
        selectedGenre,
        tvShowPage,
        totalTvShowPages,
        tvShowLoading,
    ]);

    // Detect when the user approaches the bottom of the list and load more TV shows
    useEffect(() => {
        const element = loadMoreRef.current;

        if (!element) return;
        if (!query.trim() && selectedGenre === null) return;
        if (tvShowPage >= totalTvShowPages) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadMoreTvShows();
                }
            },
            { rootMargin: '300px' }
        );

        observer.observe(element);

        // Stop observing the element when the effect is cleaned up
        return () => observer.disconnect();
    }, [
        loadMoreTvShows,
        query,
        selectedGenre,
        tvShowPage,
        totalTvShowPages,
    ]);

    // Fetch personalized TV show recommendations for the logged-in user
    useEffect(() => {
        let cancelled = false;

        async function loadRecommendations() {
            if (authLoading) return;

            if (!user || !token) {
                setRecommendations([]);
                setRecommendationLoading(false);
                setRecommendationError('');
                return;
            }

            setRecommendationLoading(true);
            setRecommendationError('');

            try {
                const response = await fetch(
                    `${API}/recommendations/tvshows`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Recommendation request failed');
                }

                const data = await response.json();

                // Fetch full details for every recommended TV show
                const details = await Promise.all(
                    (data.recommendations || []).map(async (recommendation) => {
                        try {
                            const showResponse = await fetch(
                                `${API}/tvshows/${recommendation.id}`
                            );

                            if (!showResponse.ok) return null;

                            return await showResponse.json();
                        } catch (err) {
                            console.error(
                                'Could not load recommended TV show:',
                                err
                            );
                            return null;
                        }
                    })
                );

                if (!cancelled) {
                    setRecommendations(details.filter(Boolean));
                }
            } catch (err) {
                console.error('Recommendation loading failed:', err);

                if (!cancelled) {
                    setRecommendations([]);
                    setRecommendationError(
                        'Unable to load recommendations.'
                    );
                }
            } finally {
                // Stop the loading indicator when all recommendation requests finish
                if (!cancelled) {
                    setRecommendationLoading(false);
                }
            }
        }

        loadRecommendations();

        // Prevent state updates if the component is no longer active
        return () => {
            cancelled = true;
        };
    }, [user, token, authLoading]);

    // Use the same card layout for search results and recommendations
    const renderShowCard = (show) => {
        const id = Number(show.id);
        const title = show.name || show.title || 'Unknown TV show';

        return (
            <MediaCard
                key={id}
                id={id}
                title={title}
                posterUrl={
                    show.poster_path
                        ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                        : null
                }
                date={show.first_air_date || show.release_date}
                rating={show.vote_average}
                type="tv"
                isFavorite={favoriteIds.includes(id)}
                onFavoriteToggle={() => toggleFavorite(show)}
                action={
                    <AddToGroup
                        groups={myGroups}
                        movieId={id}
                        mediaType="tv"
                        title={title}
                        posterPath={show.poster_path}
                    />
                }
            />
        );
    };

    // Show recommendations only when the user is logged in and has not started a search or selected a genre
    const showRecommendations =
        !authLoading &&
        user &&
        token &&
        !query.trim() &&
        selectedGenre === null;

    return (
        <div className="media-page">
            <h1>TV shows</h1>

            <div className="media-search">
                <input
                    type="text"
                    placeholder="Search TV shows or actors..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            searchTvShows();
                        }
                    }}
                />

                <button onClick={searchTvShows}>Search</button>

                <button
                    className={`genre-button ${showGenres ? 'active' : ''}`}
                    onClick={() => setShowGenres((current) => !current)}
                >
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

            {error && <p role="alert">{error}</p>}

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
                                {recommendations.map(renderShowCard)}
                            </MediaGrid>
                        )}
                </section>
            )}

            <MediaGrid>
                {actors.map(renderShowCard)}
                {tvshows.map(renderShowCard)}
            </MediaGrid>

            {/* Detect when the user reaches the end of the list so more TV shows can be loaded */}
            {(query.trim() || selectedGenre !== null) &&
                tvShowPage < totalTvShowPages && (
                    <div ref={loadMoreRef}>
                        {tvShowLoading && <p>Loading more TV shows...</p>}
                    </div>
                )}
        </div>
    );
}

export default TVShows;