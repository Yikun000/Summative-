import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, firestore } from '../firebase/index.js';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../context/index.jsx';
import { doc, getDoc } from 'firebase/firestore';
import './LoginView.css';

function LoginView() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useStoreContext();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            navigate('/movies');
        } catch (error) {
            setError(error.message || 'Failed to sign in with email and password');
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            setUser(user);

            const userDoc = await getDoc(doc(firestore, "users", user.uid));

            if (userDoc.exists()) {
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
            setError(error.message || 'Failed to sign in with Google');
            console.error("Google login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <h1 className="login-title">Login</h1>

            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleEmailLogin}>
                <label htmlFor="email" className="form-label">Email</label>
                <input id="email" className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />

                <label htmlFor="password" className="form-label">Password</label>
                <input id="password" className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="or-divider">
                    <span>OR</span>
                </div>

                <button type="button" onClick={handleGoogleLogin} className="google-button" disabled={loading}>
                    Sign in with Google
                </button>
            </form>
        </div>
    );
}

export default LoginView;