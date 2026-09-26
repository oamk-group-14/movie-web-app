import { Link } from 'react-router-dom'

function MediaCard({
    // Basic media information
    id,
    title,
    posterUrl,
    date,
    rating,
    type,

    // Optional action displayed inside media card
    action,

    // Favorite state and favorite toggle function
    isFavorite = false,
    onFavoriteToggle
}) {
    // Create the correct link depending on whether the media is a movie or TV show
    const link = type === 'movie'
        ? `/movies/${id}`
        : `/tvshows/${id}`

    return (
        <div className="media-card">

            {/* Poster area containing the media link, favorite button and details */}
            <div className="media-card-poster">

                {/* Clicking the poster or title opens the media details page */}
                <Link to={link}>

                    {/* Display the poster only when a poster URL is available */}
                    {posterUrl && (
                        <img
                            src={posterUrl}
                            alt={title}
                            width="200"
                        />
                    )}

                    {/* Display the movie or TV show title */}
                    <h2>{title}</h2>
                </Link>

                {/* Display the favorite button when a toggle function is provided */}
                {onFavoriteToggle && (
                    <button

                        // Add the "active" class when the media is a favorite
                        className={`favorite-heart ${isFavorite ? 'active' : ''}`}

                        // Prevent the button click from also triggering the media link
                        onClick={(event) => {
                            event.preventDefault()
                            onFavoriteToggle()
                        }}

                        // Provide an accessible description depending on is it favorite or not
                        aria-label={
                            isFavorite
                                ? `Remove ${title} from favorites`
                                : `Add ${title} to favorites`
                        }
                    >
                        ♡
                    </button>
                )}

                <div className='media-card-info'>
                {/* Display the release date/year when available */}
                    {date && <p>{date}</p>}

                    {/* Display rating when available with one decimal place  */}
                    {rating !== undefined && (
                        <p>{Number(rating).toFixed(1)}</p>
                    )}
                </div>

                {/* Display an optional custom action */}
                {action && (
                    <div className="media-card-action">
                        {action}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MediaCard