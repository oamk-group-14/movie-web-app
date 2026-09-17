import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Genres(){

    const [genres, setGenres] = useState([]);
    const [tvGenres, setTvGenres] = useState([]);
    const [tvshows, setTvshows] = useState([]);
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        async function loadGenres(){
            //fetch genres from the backend
            const response = await fetch("http://localhost:3000/api/genres");
            const data = await response.json();
            setGenres(data);
        }
        loadGenres();
    }, []);


    useEffect(() => {
        async function loadTvGenres() {
            const response = await fetch("http://localhost:3000/api/tvGenres");
            const data = await response.json();
            setTvGenres(data);
        }
        loadTvGenres();
    }, []); 

    //fetch movies by genre Id
    const fetchMoviesByGenre = async(genreId) => {
        const response = await fetch(`http://localhost:3000/api/discover/movie/genre/${genreId}`)
        const data = await response.json();
        setMovies(data);
    }

    
    const fetchTvshowsByGenre = async(genreId) => {
        const response = await fetch(`http://localhost:3000/api/discover/tv/genre/${genreId}`)
        const data = await response.json();
        setTvshows(data);
    }

    //return the data to frontend
    return (
        <div>
            <h1>Movie genres</h1>
            {genres.map(genre => (
                <button key={genre.id}
                onClick={() => fetchMoviesByGenre(genre.id)}>{genre.name}</button>
            ))}

            
            {movies.map(movie => (
                <div key={movie.id}>
                    <h3>{movie.title}</h3>
                    {movie.poster_path && (
                        <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        width="200" />
                    )}
                </div>
            ))}

            <h1>Tv show genres</h1>
            {tvGenres.map(genre => (
                <button key={genre.id}
                onClick={() => fetchTvshowsByGenre(genre.id)}>{genre.name}</button>
            ))}   
            {tvshows.map(tvshow => (
                <div key={tvshow.id}>
                    <h3>{tvshow.name}</h3>
                    {tvshow.poster_path && (
                        <img src={`https://image.tmdb.org/t/p/w300${tvshow.poster_path}`}
                        alt={tvshow.name}
                        width="200" />
                    )}
                </div>
            ))}

        </div>
    );

}