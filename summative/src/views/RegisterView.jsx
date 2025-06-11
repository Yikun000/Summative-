import './RegisterView.css';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../context/index.jsx';
import { useRef, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore, googleProvider } from '../firebase/index.js';

function RegisterView() {
    const {
        user,
        setUser,
        setSelected,
        setCart
    } = useStoreContext();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const firstName = useRef('');
    const lastName = useRef('');
    const email = useRef('');
    const password = useRef('');
    const confirmedPassword = useRef('');

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

    useEffect(() => {
        if (user) {
            navigate('/movies/genre/28');
        }
    }, [user, navigate]);

    const saveUserData = async (userId, userData) => {
        try {
            await setDoc(doc(firestore, "users", userId), userData);
        } catch (error) {
            console.error("Error saving user data:", error);
            throw error;
        }
    };

    const handleRegister = async (e) => {
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

            if (confirmedPassword.current.value !== password.current.value) {
                setError("Your passwords don't match!");
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.current.value,
                password.current.value
            );

            setUser(userCredential.user);

            const userData = {
                firstName: firstName.current.value,
                lastName: lastName.current.value,
                email: email.current.value,
                selectedGenres: selectedGenres,
                createdAt: new Date().toISOString(),
                purchases: []
            };

            await saveUserData(userCredential.user.uid, userData);

            setSelected(selectedGenres);
            setCart([]);

            navigate('/movies/genre/' + selectedGenresIds[0]);

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else {
                setError(error.message || 'Registration failed. Please try again.');
            }
            console.error("Registration error:", error);
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            setUser(user);

            const userDoc = await getDoc(doc(firestore, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setSelected(userData.selectedGenres || []);
                navigate('/movies');
            } else {
                navigate('/register/complete-profile', {
                    state: {
                        isGoogleUser: true,
                        email: user.email,
                        displayName: user.displayName
                    }
                });
            }
        } catch (error) {
            setError(error.message || 'Google sign-in failed. Please try again.');
            console.error("Google sign-in error:", error);
            setLoading(false);
        }
    };

    return (
        <div className='register'>
            <h1 className="register-title">Register</h1>

            {error && <div className="error-message">{error}</div>}

            <form className='register-form' onSubmit={handleRegister}>
                <label htmlFor="first-name" className='form-label'>First name</label>
                <input id='first-name' type="text" name='first-name' className='form-input' ref={firstName} disabled={loading} required />

                <label htmlFor="last-name" className='form-label'>Last name</label>
                <input id='last-name' type="text" name='last-name' className='form-input' ref={lastName} disabled={loading} required />

                <label htmlFor="email" className='form-label'>Email</label>
                <input id='email' type="email" name='email' className='form-input' ref={email} disabled={loading} required />

                <label htmlFor="password" className='form-label'>Password</label>
                <input id="password" type='password' name="password" className='form-input' ref={password} disabled={loading} required />

                <label htmlFor="re-password" className='form-label'>Re-enter Password</label>
                <input id='re-password' type='password' name='re-password' className='form-input' ref={confirmedPassword} disabled={loading} required />

                <div className='genre-selection'>
                    <h2>Choose Your Favourite Genres:</h2>
                    <div className='genre-checkboxes'>
                        {genres.map((item) => {
                            return (
                                <div key={item.id}>
                                    <input type='checkbox' id={`genre-${item.id}`} ref={(el) => (checkBoxes.current[item.id] = el)} disabled={loading} />
                                    <label htmlFor={`genre-${item.id}`}>{item.genre}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button type='submit' className='submit-button' disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>

                <div className="or-divider">
                    <span>OR</span>
                </div>

                <button type="button" className="google-button" onClick={handleGoogleSignIn} disabled={loading}>
                    Sign in with Google
                </button>
            </form>
        </div>
    );
}

export default RegisterView;