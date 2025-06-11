import './RegisterView.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStoreContext } from '../context/index.jsx';
import { useRef, useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase/index.js';

function CompleteProfileView() {
    const { user, setSelected } = useStoreContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const firstName = useRef('');
    const lastName = useRef('');

    const { isGoogleUser, email, displayName } = location.state || {};

    useEffect(() => {
        if (!user) {
            navigate('/register');
            return;
        }

        if (displayName) {
            const names = displayName.split(' ');
            if (firstName.current) {
                firstName.current.value = names[0] || '';
            }
            if (lastName.current && names.length > 1) {
                lastName.current.value = names.slice(1).join(' ');
            }
        }
    }, [user, navigate, displayName]);

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

    const checkBoxes = useRef({});

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const selectedGenresIds = Object.keys(checkBoxes.current)
                .filter((genreId) => checkBoxes.current[genreId].checked)
                .map(Number);

            if (selectedGenresIds.length < 5) {
                setError("You need at least 5 genres!");
                setLoading(false);
                return;
            }

            const selectedGenres = genres.filter((genre) => selectedGenresIds.includes(genre.id));

            const userData = {
                firstName: firstName.current.value,
                lastName: lastName.current.value,
                email: user.email,
                selectedGenres: selectedGenres,
                createdAt: new Date().toISOString(),
                purchases: []
            };

            await setDoc(doc(firestore, "users", user.uid), userData);

            setSelected(selectedGenres);

            navigate('/movies/genre/' + selectedGenresIds[0]);

        } catch (error) {
            setError(error.message || 'Failed to save profile. Please try again.');
            console.error("Profile completion error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='register'>
            <h1 className="register-title">Complete Your Profile</h1>

            {error && <div className="error-message">{error}</div>}

            <form className='register-form' onSubmit={handleCompleteProfile}>
                <label htmlFor="first-name" className='form-label'>First name</label>
                <input
                    id='first-name'
                    type="text"
                    name='first-name'
                    className='form-input'
                    ref={firstName}
                    disabled={loading}
                    required
                />

                <label htmlFor="last-name" className='form-label'>Last name</label>
                <input
                    id='last-name'
                    type="text"
                    name='last-name'
                    className='form-input'
                    ref={lastName}
                    disabled={loading}
                    required
                />

                <label htmlFor="email" className='form-label'>Email</label>
                <input
                    id='email'
                    type="email"
                    name='email'
                    className='form-input email-display'
                    value={email || user?.email || ''}
                    readOnly
                />

                <div className='genre-selection'>
                    <h2>Choose Your Favourite Genres:</h2>
                    <div className='genre-checkboxes'>
                        {genres.map((item) => {
                            return (
                                <div key={item.id}>
                                    <input
                                        type='checkbox'
                                        id={`genre-${item.id}`}
                                        ref={(el) => (checkBoxes.current[item.id] = el)}
                                        disabled={loading}
                                    />
                                    <label htmlFor={`genre-${item.id}`}>{item.genre}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    type='submit'
                    className='submit-button'
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
}

export default CompleteProfileView;