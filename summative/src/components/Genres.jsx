import './Genres.css';
import { Link } from 'react-router-dom';

function Genres(props) {
    return (
        <div className='genres'>
            <ul>
                {props.genresList.map((item) => {
                    return (
                        <li key={item.id}>
                            <Link to={`/movies/genre/${item.id}`}><button>{item.genre}</button></Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

export default Genres;