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