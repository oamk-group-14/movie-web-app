# AI-Powered Recommendations

## Overview

The Movie Web App includes an AI-powered recommendation
system that provides personalized movie and TV show
suggestions based on each user's favorites and reviews.

## Technologies

- React – Displays recommendations in the frontend.
- Node.js and Express – Handle recommendation requests.
- PostgreSQL – Stores user favorites and reviews.
- TMDB API – Provides movie and TV show information.
- Ollama Cloud (Gemma 4) – Generates personalized recommendations.

## How It Works

1. The user logs in to the application.
2. The backend retrieves the user's favorites and reviews.
3. Popular movies or TV shows are fetched from TMDB.
4. Titles already reviewed or favorited are excluded.
5. Ollama analyzes the user's preferences and selects up to five candidates.
6. The backend validates the AI response.
7. The frontend displays the recommendations.

## API Endpoints

- `GET /api/recommendations/movies`
- `GET /api/recommendations/tvshows`

Both endpoints require authentication.
