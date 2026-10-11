const TMDB_BASE = "https://api.themoviedb.org/3";

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

export const searchTvShows = async (req, res) => {
    try {
        // Get search term and page number from query
        const { query } = req.query;
        const page = Number(req.query.page ?? 1);

        // Check that a search term exists
        if (!query || !query.trim()) {
            return res.status(400).json({
                error: "Search query is missing"
            });
        }

        // Check that the page number is valid
        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                error: "Invalid page number"
            });
        }

        // Search TV shows from TMDB
        const data = await tmdbFetch(
            `/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`
        );

        // Send the TV shows to frontend and how many more pages of results are available
        res.json({
            results: data.results,
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results
        });

    } catch (error) {
        console.error("TV show search error:", error);

        res.status(error.status || 500).json({
            error: error.status
                ? "TMDB API request failed"
                : "An error occurred on the server"
        });
    }
};

export const searchActors = async (req, res) => {
    try {
        const { query } = req.query;

        // Check that search term exists
        if (!query || !query.trim()) {
            return res.status(400).json({
                error: "Actor name is missing"
            });
        }

        // Find the actor
        const personData = await tmdbFetch(
            `/search/person?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
        );

        // Check if an actor was found
        if (!personData.results || personData.results.length === 0) {
            return res.json({
                results: []
            });
        }

        // Use the first matching person
        const actor = personData.results[0];

        // Get the actor's TV credits
        const creditsData = await tmdbFetch(
            `/person/${actor.id}/tv_credits?language=en-US`
        );

        const uniqueCredits = (creditsData.cast || []).filter(
            (show, index, self) =>
                index === self.findIndex((item) => item.id === show.id)
        );

        // Return actor + their shows
        res.json({
            actor,
            results: uniqueCredits
        });

    } catch (error) {
        console.error("Actor search error:", error);

        res.status(error.status || 500).json({
            error: error.status
                ? "TMDB API request failed"
                : "An error occurred on the server"
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
        const data = await tmdbFetch(
            `/tv/${encodeURIComponent(id)}?language=en-US`
        );

        // Send TV show details to frontend
        res.json(data);

    } catch (error) {
        console.error("TV Show fetch error:", error);

        res.status(error.status || 500).json({
            error: error.status
                ? "TMDB API request failed"
                : "An error occurred on the server"
        });
    }
};

export const getTvGenres = async (req, res) => {
    try {
        // Search all TV show genres from TMDB
        const data = await tmdbFetch("/genre/tv/list?language=en-US");

        // Send results to frontend
        res.json(data.genres);

    } catch (error) {
        console.error("TV genre fetch error:", error);

        res.status(error.status || 500).json({
            error: error.status
                ? "TMDB API request failed"
                : "An error occurred on the server"
        });
    }
};

//Search tv-shows by genre
export const discoverTvShows = async (req, res) => {
    const genreId = req.params.id;
    // Get the requested page number from the URL
    const page = Number(req.query.page ?? 1);

    try {
        if (!genreId) {
            return res.status(400).json({
                error: "Genre ID is missing"
            });
        }

        // Check that the page number is a valid positive integer
        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                error: "Invalid page number"
            });
        }

        const data = await tmdbFetch(
            `/discover/tv?with_genres=${encodeURIComponent(genreId)}&include_adult=false&include_null_first_air_dates=false&language=en-US&page=${page}&sort_by=popularity.desc`
        );

        // Send the TV shows and pagination details to the frontend
        res.json({
            results: data.results,
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results
        });

    } catch (error) {
        console.error("Genre search error:", error);

        res.status(error.status || 500).json({
            error: error.status
                ? "TMDB API request failed"
                : "An error occurred on the server"
        });
    }
};
