import './SearchView.css';
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useStoreContext } from '../context/index.jsx';

function SearchView() {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const { cart, setCart, previousPurchases } = useStoreContext();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [query]);

    useEffect(() => {
        setPage(1);
    }, [debouncedQuery]);

    const fetchSearchResults = useCallback(async () => {
        if (!debouncedQuery.trim()) {
            setMovies([]);
            setTotalPages(0);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_KEY}&query=${encodeURIComponent(debouncedQuery)}&page=${page}`
            );
            setMovies(response.data.results);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error("Error searching movies:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, page]);

    useEffect(() => {
        fetchSearchResults();
    }, [fetchSearchResults]);

    const handleBuy = (movieId) => {
        const movie = movies.find(movie => movie.id === movieId);
        if (movie) {
            const updatedCart = [...cart, movie];
            setCart(updatedCart);
        } else {
            alert("Movie not found!");
        }
    };

    const isMoviePurchased = (movieId) => {
        return previousPurchases && previousPurchases.some(item => item.id === movieId);
    };

    return (
        <div className='search-view'>
            <h1>Search Movies</h1>
            <div className="search-container">
                <input type="text" className="search-input" placeholder="Search for movies..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {loading ? (
                <div className="loading">Searching...</div>
            ) : (
                <div>
                    {debouncedQuery && (
                        <h2 className="search-results-title">Results for "{debouncedQuery}" {totalPages > 0 ? `(Page ${page} of ${totalPages})` : ''}</h2>
                    )}
                    <div className="search-results">
                        {movies.length > 0 ? (
                            movies.map((movie) => {
                                const isInCart = cart.some(item => item.id === movie.id);
                                const isPurchased = isMoviePurchased(movie.id);

                                return (
                                    <div key={movie.id} className="search-result-item">
                                        <div className="search-result-poster">
                                            <Link to={`/movies/details/${movie.id}`}>
                                                {movie.poster_path ? (
                                                    <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="search-result-image" />
                                                ) : (
                                                    <div className="no-image">No Image Available</div>
                                                )}
                                            </Link>
                                        </div>
                                        <button className="buy-button" onClick={() => handleBuy(movie.id)} disabled={isInCart || isPurchased}>
                                            {isPurchased ? 'Purchased' : isInCart ? 'Added' : 'Buy'}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            debouncedQuery && <p className="no-results">No movies found for your search</p>
                        )}
                    </div>
                    {totalPages > 0 && (
                        <div className="search-pagination">
                            <button className="pagination-button" onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page <= 1}>Previous</button>
                            <p className="page-indicator">{page} / {totalPages}</p>
                            <button className="pagination-button" onClick={() => setPage(prev => prev < totalPages ? prev + 1 : prev)} disabled={page >= totalPages}>Next</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchView;