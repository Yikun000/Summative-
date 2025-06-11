import './MoviesView.css';
import Header from '../components/Header';
import Genres from '../components/Genres';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import { useStoreContext } from '../context/index.jsx';

function MoviesView() {
    const { selectedGenres } = useStoreContext();

    return (
        <div className='movies'>
            <Header />
            <Genres genresList={selectedGenres} />
            <div className='genre-movies'>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}

export default MoviesView;