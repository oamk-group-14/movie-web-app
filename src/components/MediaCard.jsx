import { Link } from 'react-router-dom'

function MediaCard({
    id,
    title,
    posterUrl,
    date,
    rating,
    type
}) {
    const link = type === 'movie'
        ? `/movies/${id}`
        : `/tvshows/${id}`

    return (
        <div className="media-card">
            <Link to={link}>
                {posterUrl && (
                    <img
                        src={posterUrl}
                        alt={title}
                        width="200"
                    />
                )}

                <h2>{title}</h2>
            </Link>

            {date && <p>{date}</p>}

            {rating !== undefined && (
                <p>{rating}</p>
            )}
        </div>
    )
}

export default MediaCard