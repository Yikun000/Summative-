import './Featured.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Featured() {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        async function getData() {
            setMovies((await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_KEY}`)).data.results);
        };

        getData();
    }, []);

    const randomMovies = movies && [...movies].sort(() => Math.random() - 0.5).slice(0, 5);

    return (
        <div className='featured' id='featured'>
            <h1 className="featured-header">Featured Movies</h1>
            <div className='featured-movies'>
                {randomMovies && randomMovies.map(movie => (
                    <div className="movie-card" key={movie.id}>
                        <img className="movie-poster" src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={`${movie.id}`} />
                        <h1 className='movie-title'>{`${movie.title}`}</h1>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Featured;