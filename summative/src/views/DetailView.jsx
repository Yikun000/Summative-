import './DetailView.css';
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStoreContext } from '../context/index.jsx';

function DetailView() {
    const [trailers, setTrailers] = useState([]);
    const [movie, setMovie] = useState([]);
    const { id } = useParams();
    const { cart, setCart, previousPurchases } = useStoreContext();

    const isInCart = movie.id && cart.some(item => item.id === movie.id);
    const isPurchased = movie.id && previousPurchases && previousPurchases.some(item => item.id === movie.id);

    const handleBuy = () => {
        if (!isInCart && !isPurchased && movie) {
            const updatedCart = [...cart, movie];
            setCart(updatedCart);
        }
    };

    useEffect(() => {
        async function fetchMovieDetails() {
            const movieResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_KEY}`
            );
            setMovie(movieResponse.data);

            const videosResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${import.meta.env.VITE_TMDB_KEY}`
            );
            setTrailers(videosResponse.data.results.filter((video) => video.type === "Trailer"));
        }

        fetchMovieDetails();
    }, [id]);

    return (
        <div className='detail-view'>
            <div className="movie-content">
                <div className="movie-info">
                    <h1 className="movie-title">{movie.original_title}</h1>
                    <button className="buy-button" onClick={handleBuy} disabled={isInCart || isPurchased}>
                        {isPurchased ? 'Purchased' : isInCart ? 'Added' : 'Buy'}
                    </button>
                    <p className="movie-overview">{movie.overview}</p>
                    <div className="movie-details">
                        <p>Status: {movie.status}</p>
                        <p>Language: {movie.original_language}</p>
                        <p>Runtime: {movie.runtime} minutes</p>
                        <p>Release Date: {movie.release_date}</p>
                        <p>Rating: {movie.vote_average}</p>
                        <p>Popularity: {movie.popularity}</p>
                        <p>Box Office: ${movie.revenue}</p>
                    </div>
                </div>
                {movie.poster_path && (
                    <img className="movie-poster" src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.original_title} />
                )}
            </div>
            <div className="trailers-section">
                <h2>Trailers</h2>
                <div className="trailers-grid">
                    {trailers.map((trailer) => (
                        <div key={trailer.id} className="trailer-tile">
                            <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">
                                <img className="trailer-thumbnail" src={`https://img.youtube.com/vi/${trailer.key}/0.jpg`} alt={trailer.name} />
                                <h3>{trailer.name}</h3>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DetailView;