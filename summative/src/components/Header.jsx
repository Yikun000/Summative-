import './Header.css';

import { useNavigate } from "react-router-dom";
import { useStoreContext } from '../context/index.jsx';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/index.js';

function Header() {
    const navigate = useNavigate();
    const { user, userData } = useStoreContext();

    const displayName = userData?.firstName ||
        (user?.displayName
            ? user.displayName.split(' ')[0]
            : user?.email
                ? user.email.split('@')[0]
                : 'User');

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleSearch = () => {
        navigate('/movies/search');
    };

    return (
        <div className="header">
            <div className="title">
                <h1>WOOFLIX</h1>
            </div>
            <div className="welcome-container">
                {user && (
                    <p className="welcome-message">Hello, {displayName}!</p>
                )}
            </div>
            <div className="header-buttons">
                {user ? (
                    <>
                        <button onClick={handleSearch}>Search</button>
                        <button onClick={() => navigate("/cart")}>Cart</button>
                        <button onClick={() => navigate("/settings")}>Settings</button>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate("/login")}>Login</button>
                        <button onClick={() => navigate("/register")}>Register</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Header;