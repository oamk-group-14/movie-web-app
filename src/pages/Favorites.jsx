
import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard';
import MediaGrid from '../components/MediaGrid';

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load the logged-in user's favorite movies and TV shows
    useEffect(() => {
        const loadFavorites = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please log in to view your favorites.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    'http://localhost:3000/api/favorites',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Favorites fetch failed');
                }

                const data = await response.json();

                // Convert the database fields into the format
                // expected by MediaCard and this page.
                const loadedFavorites = (data.favorites || []).map(
                    (favorite) => ({
                        id: Number(favorite.movie_id),
                        type: favorite.media_type,
                        title: favorite.title,
                        posterUrl: favorite.poster_path
                            ? `https://image.tmdb.org/t/p/w300${favorite.poster_path}`
                            : null,
                        year: favorite.release_year,
                        voteAverage: favorite.vote_average
                    })
                );

                setFavorites(loadedFavorites);
            } catch (error) {
                console.error('Error loading favorites:', error);
                setError('Unable to load favorites');
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, []);

    // Remove a movie or TV show from the logged-in user's favorites
    const removeFavorite = async (id, type) => {
        const token = localStorage.getItem('token');

        if (!token) {
            setError('Please log in to manage favorites.');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3000/api/favorites/${type}/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.error || 'Favorite removal failed'
                );
            }

            // Update the page only after the backend confirms removal.
            setFavorites((currentFavorites) =>
                currentFavorites.filter(
                    (favorite) =>
                        !(favorite.id === id && favorite.type === type)
                )
            );
        } catch (error) {
            console.error('Error removing favorite:', error);
            setError(error.message || 'Unable to remove favorite');
        }
    };

    // Filter by all media, movies, or TV shows
    const filteredFavorites = favorites.filter((favorite) => {
        if (filter === 'all') {
            return true;
        }

        return favorite.type === filter;
    });

    if (loading) {
        return <p>Loading favorites...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="media-page">
            <h1>My favorites</h1>

            <div className="favorites-filter">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>

                <button
                    className={filter === 'movie' ? 'active' : ''}
                    onClick={() => setFilter('movie')}
                >
                    Movies
                </button>

                <button
                    className={filter === 'tv' ? 'active' : ''}
                    onClick={() => setFilter('tv')}
                >
                    TV Shows
                </button>
            </div>

            {filteredFavorites.length === 0 ? (
                <p>You haven't added any favorites.</p>
            ) : (
                <MediaGrid>
                    {filteredFavorites.map((favorite) => (
                        <MediaCard
                            key={`${favorite.type}-${favorite.id}`}
                            id={favorite.id}
                            title={favorite.title}
                            posterUrl={favorite.posterUrl}
                            date={favorite.year}
                            rating={favorite.voteAverage}
                            type={favorite.type}
                            isFavorite={true}
                            onFavoriteToggle={() =>
                                removeFavorite(
                                    favorite.id,
                                    favorite.type
                                )
                            }
                        />
                    ))}
                </MediaGrid>
            )}
        </div>
    );
}

export default Favorites;
