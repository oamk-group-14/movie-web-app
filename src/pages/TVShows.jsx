import { useState } from 'react';
import { Link } from 'react-router-dom';

function TVShows() {
    const [query, setQuery] = useState('')
    const [tvshows, setTvShows] = useState([])
    const [actors, setActors] = useState([])
    const [error, setError] = useState('')


    const searchTvShows = async () => {
        if (!query.trim()) {
            setError('Please enter a show title or actor name')
            return
        }

        try {
            setError('')

            const actorResponse = await fetch(
                `http://localhost:3000/api/tvshows/actors/search?query=${encodeURIComponent(query)}`
            )

            const tvshowResponse = await fetch(
                `http://localhost:3000/api/tvshows/search?query=${encodeURIComponent(query)}`
            )

            if (!tvshowResponse.ok || !actorResponse.ok) {
                throw new Error('Search failed')
            }

            const actorData = await actorResponse.json()
            const tvshowData = await tvshowResponse.json()
            
            setActors(actorData.results || [])
            setTvShows(tvshowData.results || [])
            

        } catch (error) {
            console.error(error)
            setError('Unable to search')
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
                {actors.map((tvshow) => (
                    <div key={tvshow.id}>
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