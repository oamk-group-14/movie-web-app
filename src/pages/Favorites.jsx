import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard'
import MediaGrid from '../components/MediaGrid';

function Favorites() {
    const [favorites, setFavorites] = useState([])
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Load the user's favorite movies and TV shows when the page is opened
    useEffect(() => {
        const getFavorites = async () => {
            try {
                const response = await fetch(
                    'http://localhost:3000/api/users/favorites', {
                        credentials: 'include'
                    }
                )
        
                if (!response.ok) {
                    throw new Error('Favorites fetch failed')
                }

                const data = await response.json()

                setFavorites(data)
            } catch (error) {
                console.error(error)
                setError('Unable to load favorites')
            } finally {
                setLoading(false)
            }
        }

        getFavorites()
    }, [])

    // Remove a movie or TV show from the user's favorites
    const removeFavorite = async (id, type) => {
        try {
            const response = await fetch(
                'http://loaclhost:3000/api/favorites/${type}/${id}', {
                    method: 'DELETE',
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                    throw new Error('Favorite removal failed')
            }

            // Remove the item from favorites after a successful request
            setFavorites(
                (currentFavorites) => currentFavorites.filter(
                    (favorite) => !(favorite.id === id && favorite.type === type)
                )
            )

        } catch (error) {
            console.error(error)
        }
    }

    // Filter favorites based on the selected media type.
    const filterFavorites = favorites.filter(
        (favorite) => {
            if (filter === 'all') {
                return true
            }

            return favorite.type === filter
        }
    )

    if (loading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <div className="media-page">
            <h1>My favorites</h1>

            {/* Filter favorites by all media, movies, or TV shows */}
            <div className="favorites-filter">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                    All
                </button>

                <button className={filter === 'movie' ? 'active' : ''} onClick={() => setFilter('movie')}>
                    Movies
                </button>

                <button className={filter === 'tv' ? 'active' : ''} onClick={() => setFilter('tv')}>
                    TV Shows
                </button>
            </div>

            {filterFavorites.length === 0 ? (
                <p>You haven't added any favorites.</p>
            ) : (
                <MediaGrid>
                    {filterFavorites.map(
                        (favorite) => (
                            <MediaCard
                                key={`${favorite.type}-${favorite.id}`}
                                id={favorite.id}
                                title={favorite.title}
                                posterUrl={favorite.posterUrl}
                                date={favorite.year}
                                rating={favorite.voteAverage}
                                type={favorite.type}
                                isFavorite={true}
                                onFavoriteToggle={() => removeFavorite(favorite.id, favorite.type)}
                            />
                        )
                    )}
                </MediaGrid>
            )}
        </div>
    )
}

export default Favorites;