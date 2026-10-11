// Import database functions for the logged-in user's reviews and favorites
import { getUserReviews, getUserFavorites } from '../models/recommend.js';

const TMDB_BASE = 'https://api.themoviedb.org/3';

// Fetch data from TMDB using the API token from the .env file
const tmdbFetch = async (path) => {
    const response = await fetch(`${TMDB_BASE}${path}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
            accept: 'application/json'
        }
    });

    // Stop processing if TMDB returns an error response
    if (!response.ok) {
        throw new Error('TMDB API request failed');
    }

    return response.json();
};

// Get the logged-in user's actual preferences from the database
const getUserPreferenceData = async (userId, mediaType) => {
    // Fetch reviews and favorites at the same time
    const [reviews, favorites] = await Promise.all([
        getUserReviews(userId, mediaType),
        getUserFavorites(userId, mediaType)
    ]);

    // Collect IDs of titles the user has already reviewed
    const reviewedIds = reviews.map((review) =>
        Number(review.movie_id)
    );

    // Collect IDs of titles the user has added to favorites
    const favoriteIds = favorites.map((favorite) =>
        Number(favorite.movie_id)
    );

    // Exclude reviewed and favorited titles from recommendations
    const excludedIds = new Set([
        ...reviewedIds,
        ...favoriteIds
    ]);

    return {
        reviews,
        favorites,
        excludedIds
    };
};

// Build an AI prompt using the user's actual favorites and reviews
const buildPreferencePrompt = (reviews, favorites, mediaLabel) => {
    // Format the user's reviews, ratings, and written feedback.
    const reviewText = reviews.length > 0
        ? reviews.map((review) =>
            `- ${review.title} | Rating: ${review.rating} | Review: ${review.review_text || 'No written review'}`
        ).join('\n')
        : 'No reviews yet.';

    // Format the user's favorite titles
    const favoriteText = favorites.length > 0
        ? favorites.map((favorite) =>
            `- ${favorite.title}`
        ).join('\n')
        : 'No favorites yet.';

    // Explain how the AI should personalize its recommendations
    return `
        The user's actual ${mediaLabel} favorites:
        ${favoriteText}

        The user's actual ${mediaLabel} reviews and ratings:
        ${reviewText}

        Personalization instructions:
        - Base recommendations on the user's actual favorites and reviews.
        - Give more weight to highly rated titles and positive review text.
        - Avoid themes and styles the user consistently rates poorly.
        - If the user has little or no history, use the candidate descriptions and ratings without inventing user preferences.
        `;
        };

// Test endpoint for checking that the recommendation route works
export const testUserPreferences = async (req, res) => {
    res.json({
        message: 'Recommendation route works'
    });
};

// Generate personalized movie recommendations
export const getMovieRecommendations = async (req, res) => {
    try {
        // Get the logged-in user's actual movie preferences from the database
        const preferenceData = await getUserPreferenceData(
            req.user.id,
            'movie'
        );

        console.log(
            'RECOMMENDATION: Starting personalized movie recommendations'
        );

        // Fetch popular movies from TMDB
        const tmdbData = await tmdbFetch(
            '/movie/popular?language=en-US&page=1'
        );

        // Exclude movies the user has already reviewed or favorited
        const movieCandidates = tmdbData.results
            .filter(
                (movie) =>
                    !preferenceData.excludedIds.has(Number(movie.id))
            )
            .slice(0, 30)
            .map((movie) => ({
                id: movie.id,
                title: movie.title,
                rating: movie.vote_average
            }));

        // Stop if there are no available movie candidates
        if (movieCandidates.length === 0) {
            return res.json({
                recommendations: []
            });
        }

        // Create the prompt using the user's real preferences
        const prompt = `
            You are a movie recommendation AI.

            You are recommending movies for one user.

            ${buildPreferencePrompt(
                preferenceData.reviews,
                preferenceData.favorites,
                'movie'
            )}

            Choose up to 5 movies from the candidate list.

            Candidate movies:
            ${JSON.stringify(movieCandidates, null, 2)}

            Return ONLY valid JSON using this structure:
            {
                "recommendations": [
                    {
                        "id": 123
                    }
                ]
            }

            Rules:
            - Return up to 5 recommendations.
            - Every id MUST come from the candidate list.
            - Never invent an id.
            - Do not recommend the same movie twice.
            - Recommend movies based on the user's actual favorites and reviews.
            - Return valid JSON only, without Markdown or extra text.
            `;

        console.log(
            'RECOMMENDATION: Sending movie request to Ollama'
        );

        // Send the personalized recommendation request to Ollama
        const response = await fetch(
            `${process.env.OLLAMA_URL}/api/generate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gemma4:cloud',
                    prompt,
                    stream: false,
                    format: 'json'
                }),

                // Allow enough time for the AI model to respond
                signal: AbortSignal.timeout(400000)
            }
        );

        console.log(
            'RECOMMENDATION: Ollama status:',
            response.status
        );

        // Stop processing if Ollama returns an error
        if (!response.ok) {
            const errorText = await response.text();

            console.error(
                'OLLAMA ERROR RESPONSE:',
                errorText
            );

            throw new Error('Ollama request failed');
        }

        // Convert the Ollama response into a JavaScript object
        const data = await response.json();

        // Remove Markdown code fences if the AI includes them
        const cleanedResponse = data.response
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        // Parse the JSON generated by the AI
        const aiResult = JSON.parse(cleanedResponse);

        // Check that the AI returned a recommendations array
        if (!Array.isArray(aiResult.recommendations)) {
            throw new Error(
                'AI response does not contain recommendations'
            );
        }

        // Create a list of valid TMDB movie IDs
        const validMovieIds = new Set(
            movieCandidates.map((movie) => Number(movie.id))
        );

        // Keep only valid, unique recommendations
        const validRecommendations = aiResult.recommendations
            .filter((recommendation) =>
                validMovieIds.has(Number(recommendation.id))
            )
            .filter(
                (recommendation, index, array) =>
                    array.findIndex(
                        (item) =>
                            Number(item.id) === Number(recommendation.id)
                    ) === index
            )
            .slice(0, 5);

        console.log(
            'RECOMMENDATION: Valid movie recommendations:',
            validRecommendations
        );

        // Return the recommendations to the frontend
        return res.json({
            recommendations: validRecommendations
        });

    } catch (error) {
        // Log the error so it can be investigated during development
        console.error(
            'RECOMMENDATION ERROR:',
            error
        );

        return res.status(500).json({
            error: 'Could not get movie recommendations'
        });
    }
};

// Get personalized TV show recommendations for the logged-in user
export const getTvShowRecommendations = async (req, res) => {
    try {
        // Get the logged-in user's ID
        const userId = req.user.id;

        // Fetch the user's TV show reviews and favorites
        const { reviews, favorites, excludedIds } =
            await getUserPreferenceData(userId, 'tv');

        // Fetch popular TV shows from TMDB
        const data = await tmdbFetch('/tv/popular?language=en-US&page=1');

        // Exclude TV shows the user has already reviewed or favorited
        const candidates = (data.results || [])
            .filter(show => !excludedIds.has(String(show.id)))
            .slice(0, 30);

        // Return an empty list if there are no available candidates
        if (candidates.length === 0) {
            return res.json({ recommendations: [] });
        }

        // Build a prompt using the user's favorites and reviews
        const prompt = `
            ${buildPreferencePrompt(reviews, favorites, 'TV shows')}

            Recommend up to 5 TV shows from the following candidates.
            Use the user's favorites and reviews to personalize the recommendations.
            Only recommend IDs from the candidate list.
            Return valid JSON in this format:

            {"recommendations":[{"id":123}]}

            Candidates:
            ${JSON.stringify(candidates.map(show => ({
                id: show.id,
                title: show.name,
                vote_average: show.vote_average,
            })))}
            `;

        // Ask Ollama to generate personalized recommendations
        const response = await fetch(
            `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gemma4:cloud',
                    prompt,
                    stream: false,
                    format: 'json'
                }),
                signal: AbortSignal.timeout(400000)
            }
        );

        // Handle Ollama errors
        if (!response.ok) {
            throw new Error(`Ollama request failed: ${response.status}`);
        }

        // Parse the response returned by Ollama
        const ollamaData = await response.json();
        let result;

        try {
            // Remove optional markdown code fences before parsing JSON
            const cleanedResponse = ollamaData.response
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/, '');

            result = JSON.parse(cleanedResponse);
        } catch {
            throw new Error('Ollama returned invalid JSON');
        }

        // Keep only valid unique recommendations from the candidate list
        const candidateIds = new Set(candidates.map(show => String(show.id)));
        const seenIds = new Set();

        const recommendations = (result.recommendations || [])
            .filter(item => {
                const id = String(item.id);

                if (!candidateIds.has(id) || seenIds.has(id)) {
                    return false;
                }

                seenIds.add(id);
                return true;
            })
            .slice(0, 5);

        // Return the recommendations to the frontend
        return res.json({ recommendations });
    } catch (error) {
        // Log the error and return a server error response
        console.error('TV show recommendations error:', error);
        return res.status(500).json({
            error: 'Unable to load TV show recommendations'
        });
    }
};