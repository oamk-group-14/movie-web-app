# Movie Web App

Web Programming Application – OAMK Group Project

## About

A full-stack web application for searching and browsing movies and TV shows. Movie and TV show information is provided by the TMDB API.

The application consists of a React frontend, an Express backend and a PostgreSQL database, all running with Docker.

## Features

* Search for movies
* Search for TV shows
* View detailed information about individual movies
* View detailed information about individual TV shows
* Navigation between pages using React Router
* TMDB API integration
* PostgreSQL database

## Project Structure

```text
movie-web-app/
├── api/
│   ├── controllers/    # Backend logic and TMDB requests
│   ├── routes/         # Backend API routes
│   ├── models/         # Database-related code
│   └── init.sql        # Database initialization
│
├── src/
│   ├── pages/          # React pages and views
│   └── App.jsx         # Frontend routing and navigation
│
├── docker-compose.yml
└── .env.example
```

## TMDB API

TMDB is used as the source for movie and TV show information.

API documentation:

https://developer.themoviedb.org/reference/intro/getting-started

The documentation contains information about endpoints, parameters, response data and available filters such as genres, popularity, release dates and ratings.

Current TMDB endpoints:

```text
/search/movie
/movie/{id}

/search/tv
/tv/{id}
```

## Application Routes

```text
/                  Home
/movies            Movie search
/movies/:id        Movie details
/tvshows           TV show search
/tvshows/:id       TV show details
```
