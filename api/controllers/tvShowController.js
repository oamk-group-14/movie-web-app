export const searchTvShows = async (req, res) => {
  try {
    // Get search term from query
    const { query } = req.query;

    // Check that search term exists
    if (!query) {
      return res.status(400).json({
        error: "Search query is missing"
      });
    }

    // Search TV shows from TMDB
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
      {
        headers: {
          // TMDB API token from .env
          Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
          accept: "application/json"
        }
      }
    );

    // Return TMDB error if request fails
    if (!response.ok) {
      return res.status(response.status).json({
        error: "TMDB API request failed"
      });
    }

    const data = await response.json();

    // Send results to frontend
    res.json(data);
  } catch (error) {
    console.error("TV show search error:", error);

    // Handle server errors
    res.status(500).json({
      error: "An error occurred on the server"
    });
  }
};

export const searchActors = async (req, res) => {
    try {
        const { query } = req.query

        // Check that search term exists
        if (!query) {
            return res.status(400).json({
                error: 'Actor name is missing'
            })
        }

        // Find the actor
        const personResponse = await fetch(
            `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                    accept: 'application/json'
                }
            }
        )

        if (!personResponse.ok) {
            return res.status(personResponse.status).json({
                error: 'Actor search failed'
            })
        }

        const personData = await personResponse.json()

        // Check if an actor was found
        if (!personData.results || personData.results.length === 0) {
            return res.json({
                results: []
            })
        }

        // Use the first matching person
        const actor = personData.results[0]

        // Get the actor's movie credits
        const creditsResponse = await fetch(
            `https://api.themoviedb.org/3/person/${actor.id}/tv_credits?language=en-US`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                    accept: 'application/json'
                }
            }
        )

        if (!creditsResponse.ok) {
            return res.status(creditsResponse.status).json({
                error: 'Could not get actor credits'
            })
        }

        const creditsData = await creditsResponse.json()

        const uniqueCredits = creditsData.cast.filter(
          (show, index, self) =>
          index === self.findIndex((item) => item.id === show.id)
        )
        
        // Return actor + their shows
        res.json({
            actor: actor,
            results: uniqueCredits
        })

    } catch (error) {
        console.error('Actor search error:', error)

        res.status(500).json({
            error: 'An error occurred on the server'
        })
    }
}

export const getTvShow = async (req, res) => {
  try {
    // Get TV show ID from URL
    const { id } = req.params;

    // Check that ID exists
    if (!id) {
      return res.status(400).json({
        error: "TV Show ID is missing"
      });
    }

    // Get TV show details from TMDB
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
          accept: "application/json"
        }
      }
    );

    // Return TMDB error if request fails
    if (!response.ok) {
      return res.status(response.status).json({
        error: "TMDB API request failed"
      });
    }

    const data = await response.json();

    
    // Send TV show details to frontend
    res.json(data);
  } catch (error) {
    console.error("TV Show fetch error:", error);

    // Handle server errors
    res.status(500).json({
      error: "An error occurred on the server"
    });
  }
};

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
