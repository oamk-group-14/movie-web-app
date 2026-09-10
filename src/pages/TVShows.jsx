import { useState } from 'react';
import { Link } from 'react-router-dom';

function TVShows() {
    const [query, setQuery] = useState('')
    const [tvshows, setTvShows] = useState([])
    const [error, setError] = useState('')

    const searchTvShows = async () => {
        // Check that the search field is not empty
        if (!query.trim()) {
            setError('Please enter tv show title')
            return
        }

        try {
            setError('')

            // Search TV shows through the backend
            const response = await fetch(
                `http://localhost:3000/api/tvshows/search?query=${encodeURIComponent(query)}`
            )

            // Check if the request was successful
            if (!response.ok) {
                throw new Error('Tv show search failed')
            }

            const data = await response.json()

            // Save search results to state
            setTvShows(data.results || [])
        }

        catch (error) {
            console.error(error)
            setError('Unable to search for tv shows')
        }
    }

    // Return TV show details to frontend
    return (
        <div>
            <h1>TV shows</h1>

            <input
                type="text"
                placeholder="Search tv shows..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />

            <button onClick={searchTvShows}>
                Search
            </button>

            {error && <p>{error}</p>}

            <div>
                {tvshows.map((tvshow) => (
                    <div key={tvshow.id}>
                        {/*Link to TV show page*/}
                        <Link to={`/tvshows/${tvshow.id}`}>
                            <h2>{tvshow.name}</h2>

                            {tvshow.poster_path && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w300${tvshow.poster_path}`}
                                    alt={tvshow.name}
                                    width="200"
                                />
                            )}
                        </Link>

                        <p>{tvshow.first_air_date}</p>
                        <p>{tvshow.vote_average}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TVShows