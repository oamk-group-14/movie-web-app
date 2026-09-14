export const searchMovies = async (req, res) => {
  try {
    // Get search term from query
    const { query } = req.query;

    // Check that search term exists
    if (!query) {
      return res.status(400).json({
        error: "Search query is missing"
      });
    }

    // Search movies from TMDB
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
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
    console.error("Movie search error:", error);

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
            `https://api.themoviedb.org/3/person/${actor.id}/movie_credits?language=en-US`,
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

        // Return actor + their movies
        res.json({
            actor: actor,
            results: creditsData.cast || []
        })

    } catch (error) {
        console.error('Actor search error:', error)

        res.status(500).json({
            error: 'An error occurred on the server'
        })
    }
}

/*export const searchActors = async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({
        error: 'Actor name is missing'
      })
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
          accept: 'application/json'
        }
      }
    )

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'TMDB API request failed'
      })
    }

    const data = await response.json()

    res.json(data)
  } catch (error) {
    console.error('Actor search error:', error)

    res.status(500).json({
      error: 'An error occurred on the server'
    })
  }
}*/

export const getMovie = async (req, res) => {
  try {
    // Get movie ID from URL
    const { id } = req.params;

    // Check that ID exists
    if (!id) {
      return res.status(400).json({
        error: "Movie ID is missing"
      });
    }

    // Get movie details from TMDB
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
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

    // Send movie details to frontend
    res.json(data);
  } catch (error) {
    console.error("Movie fetch error:", error);

    // Handle server errors
    res.status(500).json({
      error: "An error occurred on the server"
    });
  }
};