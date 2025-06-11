import "./GenreView.css";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { useStoreContext } from '../context/index.jsx';

const genres = [
    { genre: "Action", id: 28 },
    { genre: "Animation", id: 16 },
    { genre: "Crime", id: 80 },
    { genre: "Sci-Fi", id: 878 },
    { genre: "Mystery", id: 9648 },
    { genre: "Adventure", id: 12 },
    { genre: "Family", id: 10751 },
    { genre: "History", id: 36 },
    { genre: "Fantasy", id: 14 },
    { genre: "Horror", id: 27 }
];

function GenreView() {
    const { genreID } = useParams();
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const { cart, setCart, previousPurchases } = useStoreContext();
    const selectedGenre = genres.find(genre => genre.id === parseInt(genreID));
    const genreName = selectedGenre ? selectedGenre.genre : "Movies in Genre";

    useEffect(() => {
        async function fetchMovies() {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_KEY}&with_genres=${genreID}&page=${page}`
                );
                setMovies(response.data.results);
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        }
        fetchMovies();
    }, [genreID, page]);

    const handleBuy = (movieId) => {
        const movie = movies.find(movie => movie.id === movieId);
        if (movie) {
            const updatedCart = [...cart, movie];
            setCart(updatedCart);
        } else {
            alert("Movie not found!");
        }
    }

    const isMoviePurchased = (movieId) => {
        return previousPurchases && previousPurchases.some(item => item.id === movieId);
    };

    return (
        <div className="genre-view">
            <h1>{genreName}</h1>
            <div className="genre-view-content">
                {movies.length > 0 ? (
                    movies.map((movie) => {
                        const isInCart = cart.some(item => item.id === movie.id);
                        const isPurchased = isMoviePurchased(movie.id);

                        return (
                            <div key={movie.id} className="genre-view-item">
                                <div className="genre-view-poster">
                                    <Link to={`/movies/details/${movie.id}`}>
                                        {movie.poster_path ? (
                                            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="genre-view-image" />
                                        ) : (
                                            <div className="no-image">No Image Available</div>
                                        )}
                                    </Link>
                                </div>
                                <button className="buy-button" onClick={() => handleBuy(movie.id)} disabled={isInCart || isPurchased}>
                                    {isPurchased ? 'Purchased' : isInCart ? 'Added' : 'Buy'}
                                </button>
                            </div>
                        )
                    })
                ) : (
                    <p>No movies available for this genre.</p>
                )}
            </div>
            <div className="genre-view-pagination">
                <button className="genre-view-pagination-button" onClick={() => setPage((p) => Math.max(p - 1, 1))}>Prev</button>
                <button className="genre-view-pagination-button" onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
        </div>
    );
}

export default GenreView;