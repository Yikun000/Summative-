import './Featured.css';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';

function Featured() {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        async function getData() {
            const res = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_KEY}`);
            setMovies(res.data.results);
        }
        getData();
    }, []);

    const randomMovies = [...movies].sort(() => Math.random() - 0.5).slice(0, 5);

    return (
        <div className='featured' id='featured'>
            <h1 className="featured-header">Featured Movies</h1>
            <div className='featured-movies'>
                {randomMovies.map(movie => (
                    <MovieCard key={movie.id} title={movie.title} posterPath={movie.poster_path} />
                ))}
            </div>
        </div>
    );
}

function MovieCard({ title, posterPath }) {
    const titleRef = useRef(null);

    useEffect(() => {
        const el = titleRef.current;
        if (el.scrollWidth > el.offsetWidth) {
            el.style.fontSize = '0.7rem'; 
        }
    }, []);

    return (
        <div className="movie-card">
            <img className="movie-poster" src={`https://image.tmdb.org/t/p/w500${posterPath}`} alt={title} />
            <h1 className="movie-title" ref={titleRef}>{title}</h1>
        </div>
    );
}

export default Featured;