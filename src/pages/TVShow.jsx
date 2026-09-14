import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function TVShow() {
    const {id} = useParams();
    const [tvshow, setTvShow]  = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false; // Used to ignore a previous request if it was still loading it
        // Get TV show ID from the URL
        const getTvShow = async () => {
            setError(''); // Previous errors are cleared
            setTvShow(null); // Loading message comes even when switching searches
            try  {
                // Fetch TV show details from backend
                const response = await fetch(
                    `http://localhost:3000/api/tvshows/${id}`
                )

                // Check if the request was successful
                if (!response.ok) {
                    throw new Error('Tv Show fetch failed')
                }

                const data = await response.json()
                if (!ignore) setTvShow(data);
            }

            catch (error) {
                console.error(error)
                if (!ignore) setError('Unable to load TV Shows')
            }
        }

        getTvShow();

        return () => { ignore = true; };
    }, [id]) 

    // Show error message if fetching fails
    if (error) {
        return <p>{error}</p>
    }

    // Show loading message while fetching
    if (!tvshow) {
        return<p>Loading...</p>
    }
    
    // Return TV show details to frontend
    return (
        <div>
            <h1>{tvshow.name}</h1>
            
            {tvshow.poster_path && (
                <img
                    src={`https://image.tmdb.org/t/p/w300${tvshow.poster_path}`}
                    alt={tvshow.name}
                    width="200"
                />
            )}

            <p>{tvshow.overview}</p>
            <p>First Air Date: {tvshow.first_air_date}</p>
            <p>Genres: {tvshow.genres.map((genre) => genre.name).join(', ')}</p>
            <p>Vote Average: {tvshow.vote_average}</p>
        </div>
    )
}

export default TVShow