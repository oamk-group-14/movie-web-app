# Movie Web App

**Web Programming Application – Oulu University of Applied Sciences (OAMK), Autumn 2026**

## About

Movie Web App is a full-stack web application developed as a group project for the Web Programming course at Oulu University of Applied Sciences. The application is designed for movie and TV show enthusiasts who want to discover content, share opinions, manage favorites, and interact with other users through groups.

The application uses **The Movie Database (TMDB) API** to retrieve movie and TV show information. It is built with React, Node.js, Express, and PostgreSQL, with Docker used to run the application services.

In addition to the required features, the project includes an AI-powered recommendation system that provides personalized movie and TV show suggestions based on each user's favorites and reviews.

## Features

### Movies and TV Shows

- Search for movies and TV shows by title and related actors.
- Browse TV shows by genre.
- View detailed information about individual movies and TV shows.
- Browse popular and currently playing movies.
- Load additional search results as the user scrolls.
- Access personalized AI recommendations on the movie and TV show pages.

### User Accounts and Authentication

- Register a new user account and log in.
- Log out securely.
- Delete an account and its associated user data.
- Protect features and pages that require authentication.
- Validate registration passwords according to the application's requirements.

### Reviews and Favorites

- Write movie reviews with a text comment and a rating from 1 to 5 stars.
- Browse reviews written by users.
- Create and manage a personal favorites list.
- Share a favorites list through a public URL.

### Groups and Collaboration

- Create and delete groups.
- Browse available groups and view individual group pages.
- Send group membership requests.
- Allow group owners to accept or reject membership requests.
- Allow group owners to remove members and members to leave groups.
- Customize group pages by adding movies or TV shows.

### AI-Powered Recommendations

The application includes a personalized recommendation system implemented using **Ollama Cloud and the Gemma 4 cloud model**.

- Generate separate movie and TV show recommendations.
- Use the logged-in user's favorites, ratings, and written reviews to personalize suggestions.
- Give more weight to highly rated titles and positive review feedback.
- Retrieve candidate titles from TMDB and ask the AI to select up to five recommendations.
- Exclude titles that the user has already favorited or reviewed.
- Validate the AI-generated results against the available candidates to prevent invalid or duplicate recommendations.
- Display recommendations directly on the corresponding movie or TV show page.

Recommendations are generated using the user's existing preferences rather than a fixed list of suggestions. When the user has little or no review history, the system can use the available candidate information without assuming preferences that the user has not expressed.

The recommendation endpoints require authentication, and API credentials are configured through environment variables.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend and user interface |
| React Router | Client-side navigation and routing |
| Node.js | Backend runtime |
| Express | REST API and server-side logic |
| PostgreSQL | Database and persistent application data |
| TMDB API | Movie and TV show information |
| Ollama Cloud (Gemma 4) | AI-powered personalized recommendations |
| Docker | Application services and development environment |
| Postman | API development and testing |

## Project Structure

```text
movie-web-app/
├── .postman/                   # Postman-related files
├── api/                        # Backend (Express and PostgreSQL)
│   ├── controllers/             # Backend logic for movies, TV shows, recommendations, users, etc.
│   ├── middleware/              # Authentication and error handling
│   ├── models/                  # Database models, including users, recommendations, favorites and reviews
│   ├── routes/                  # Backend API routes
│   ├── init.sql                 # Database initialization
│   └── ...                      # Other backend files
├── docs/                        # Project documentation
├── postman/                     # Postman collections and API testing
├── src/                         # React frontend
│   ├── components/              # Reusable UI components, including navigation, media grids and protected routes
│   ├── context/                 # Login and authentication context
│   ├── hooks/                   # Custom React hooks, including useMyGroups
│   ├── pages/                   # Application pages and views
│   ├── App.jsx                  # Main application component and route definitions
│   ├── index.css                # Global application styles
│   └── ...                      # Other frontend files
└── ...                           # Other project and configuration files
```

## API Integrations

### The Movie Database (TMDB)

TMDB provides movie and TV show data, including titles, posters, ratings, release dates, genres, and detailed information.

Documentation: https://developer.themoviedb.org/reference/intro/getting-started

The application uses TMDB endpoints for searching, retrieving details, browsing popular titles, discovering currently playing movies, and filtering content by genre.

Examples of endpoints used include:

```text
/search/movie
/movie/{id}

/search/tv
/tv/{id}

/movie/popular
/movie/now_playing
/tv/popular
```

### Ollama Cloud

Ollama Cloud powers the personalized recommendation feature. The backend retrieves the authenticated user's favorites and reviews from PostgreSQL, builds a prompt containing those preferences and a list of candidate titles from TMDB, and sends the request to the AI model.

The model returns recommendations as JSON containing title IDs. The backend validates the response and returns the accepted recommendations to the frontend, which retrieves the full title details from TMDB before displaying them.

The recommendation API uses the following endpoints:

```text
GET /api/recommendations/movies
GET /api/recommendations/tvshows
```

Both endpoints require a valid authentication token.

The Ollama API key and TMDB access token must be configured in the backend environment. Secret credentials should not be committed to version control.

## Application Routes

```text
| Route | Description | Access |
|---|---|---|
| `/` | Home page | Public |
| `/movies` | Search and browse movies, including personalized recommendations | Public |
| `/movies/:id` | Movie details | Public |
| `/tvshows` | Search and browse TV shows, including personalized recommendations | Public |
| `/tvshows/:id` | TV show details | Public |
| `/now-showing` | Movies currently playing in cinemas | Public |
| `/register` | Create a new account | Public |
| `/login` | Log in to an existing account | Public |
| `/movies/:movieId/review` | Submit a movie review | Public route |
| `/tvshows/:id/review` | Submit a TV show review | Public route |
| `/groups` | Browse available groups | Public |
| `/groups/:id` | View a group page | Public route |
| `/favorites/shared/:shareToken` | View a shared favorites list | Public |
| `/account` | View account information and manage the account | Authenticated |
| `/favorites` | Manage personal favorites | Authenticated |
| `/groups/new` | Create a new group | Authenticated |
```

Note: Routes marked as public are accessible without the ProtectedRoute wrapper. Actions such as submitting reviews or accessing group content may still require authentication or authorization checks.
Additional pages support authentication, favorites, reviews, and group functionality.

## Development and Project Management

The project was developed collaboratively using the following tools:

- **Figma** – UI/UX design and interface planning.
- **GitHub** – Version control, source code management, and collaboration.
- **Scrum** – Iterative development and project management.
- **Excel** – Tracking working hours and task progress.
- **Discord and Zoom** – Team communication and meetings.
- **Postman** – Testing and verifying REST API endpoints.

Project documentation, including database design, interface planning, and REST API documentation, is maintained in the `docs/` directory.

## Testing

Postman was used to test API endpoints during development. The project also includes automated REST API tests covering key authentication and review-related functionality, including registration, login, logout, account deletion, and browsing reviews.

Both successful requests and error cases are considered when testing the API.
