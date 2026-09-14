export const getGenres = async (req, res) => {
    try {

        // Search all movie genres from TMDB
        const response = await fetch (`https://api.themoviedb.org/3/genre/movie/list?language=en`, 
        {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                accept: "application/json"
                }
            }
        );

        const data = await response.json()

        //Send results to frontend
        res.json(data.genres)

    } catch (error) {
        res.status(500).json({ error: "internal server error" });
    }
}

export const getTvGenres = async (req, res) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/tv/list?language=en`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                    accept: "application/json"
                }
            }
        );
        const data = await response.json()
        res.json(data.genres)
    } catch (error) {
        res.status(500).json({ error: "internal server error" });
    }
}


// Search movies by genre
export const discoverMovies = async (req, res) => {
	const genreId = req.params.id

    try {
    const response = await fetch (`https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`,
        {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                accept: "application/json"
                }
            }
        );
        const data = await response.json()

        res.json(data.results);

    } catch (error) {
        res.status(500).json({ error: "internal server error" });
    }
}


//Search tv-shows by genre
export const discoverTvShows = async (req, res) => {
    const genreId = req.params.id 

    try {

    const response = await fetch (`https://api.themoviedb.org/3/discover/tv?with_genres=${genreId}&include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc`,
        {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                accept: "application/json"
            }
        }
    );
    const data = await response.json()
    //Send results to frontend
    res.json(data.results)
    
    } catch (error) {
        res.status(500).json({ error: "internal server error" });
    }
} 




