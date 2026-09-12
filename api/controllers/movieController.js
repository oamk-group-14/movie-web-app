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