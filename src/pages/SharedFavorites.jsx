import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MediaCard from '../components/MediaCard';
import MediaGrid from '../components/MediaGrid';

function SharedFavorites() {
    const { shareToken } = useParams();
    const [listName, setListName] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load a shared favorite list (no login required)
    useEffect(() => {
        const loadSharedList = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/favorites/shared/${shareToken}`
                );

                if (response.status === 404) {
                    throw new Error('This shared list was not found.');
                }
                if (!response.ok) {
                    throw new Error('Unable to load shared list');
                }

                const data = await response.json();

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

                setListName(data.listName);
                setFavorites(loadedFavorites);
            } catch (error) {
                console.error('Error loading shared list:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadSharedList();
    }, [shareToken]);

    if (loading) {
        return <p>Loading list...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="media-page">
            <h1>{listName}</h1>

            {favorites.length === 0 ? (
                <p>This list is empty.</p>
            ) : (
                <MediaGrid>
                    {favorites.map((favorite) => (
                        <MediaCard
                            key={`${favorite.type}-${favorite.id}`}
                            id={favorite.id}
                            title={favorite.title}
                            posterUrl={favorite.posterUrl}
                            date={favorite.year}
                            rating={favorite.voteAverage}
                            type={favorite.type}
                        />
                    ))}
                </MediaGrid>
            )}
        </div>
    );
}

export default SharedFavorites;