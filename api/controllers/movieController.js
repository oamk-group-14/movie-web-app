const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// These are used to save Now Showing movies to server memory for 60 minutes to decrease wait time when reloading page
let nowShowingCache = null; 
let nowShowingCachedAt = 0;
const CACHE_DURATION = 60 * 60 * 1000;

// Shared helper for all TMDB requests
const tmdbFetch = async (path) => {
  const response = await fetch(`${TMDB_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      accept: "application/json"
    }
  });

  if (!response.ok) {
    const error = new Error("TMDB API request failed");
    error.status = response.status;
    throw error;
  }

  return response.json();
};

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

    // This can be replaced with shared helper at the top of the page
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

    // This can be replaced with shared helper at the top of the page
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

export const getNowShowing = async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if still fresh (under 60min)
    if (nowShowingCache && now - nowShowingCachedAt < CACHE_DURATION) {
      return res.json(nowShowingCache);
    }

    const data = await tmdbFetch(
      "/movie/now_playing?language=en-US&region=FI&page=1"
    );

    const movies = data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      year: movie.release_date ? movie.release_date.slice(0, 4) : null,
      posterUrl: movie.poster_path
        ? `${TMDB_IMAGE_BASE}/w300${movie.poster_path}`
        : null,
      overview: movie.overview,
      voteAverage: movie.vote_average
    }));

    nowShowingCache = movies;
    nowShowingCachedAt = now;

    res.json(movies);
  } catch (error) {
    console.error("Now showing fetch error:", error);

    res.status(error.status || 500).json({
      error: error.status
        ? "TMDB API request failed" // If error status is found
        : "An error occurred on the server" // If error status not found
    });
  }
};

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
