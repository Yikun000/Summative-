import './SettingsView.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useStoreContext } from '../context/index.jsx';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase/index.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/index.js';

function SettingsView() {
  const {
    user,
    firstName,
    lastName,
    email,
    selectedGenres,
    previousPurchases,
    setSelected,
    updateUserProfile,
    isAuthReady
  } = useStoreContext();

  const navigate = useNavigate();
  const checkBoxes = useRef({});
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

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

  useEffect(() => {
    if (isAuthReady && !user) {
      navigate('/login');
    }
  }, [user, navigate, isAuthReady]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !user.uid) return;

      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || user.email || ''
          });

          console.log("Loaded user data from Firestore:", userData);
        } else {
          console.log("No user document found in Firestore");
          setFormData({
            firstName: firstName || '',
            lastName: lastName || '',
            email: user.email || email || ''
          });
        }

        if (user.providerData && user.providerData.length > 0) {
          const emailProvider = user.providerData.find(
            provider => provider.providerId === 'password'
          );
          setIsEmailUser(!!emailProvider);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [user, firstName, lastName, email]);

  useEffect(() => {
    if (selectedGenres && selectedGenres.length > 0) {
      setTimeout(() => {
        selectedGenres.forEach(genre => {
          if (checkBoxes.current[genre.id]) {
            checkBoxes.current[genre.id].checked = true;
          }
        });
      }, 100);
    }
  }, [selectedGenres]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const selectedGenresIds = Object.keys(checkBoxes.current)
        .filter((genreId) => checkBoxes.current[genreId]?.checked)
        .map(Number);

      if (selectedGenresIds.length < 5) {
        setMessage({ text: "You need at least 5 genres!", type: 'error' });
        setLoading(false);
        return;
      }

      const updatedGenres = genres.filter((genre) => selectedGenresIds.includes(genre.id));

      const userDocRef = doc(firestore, "users", user.uid);

      const updates = {
        selectedGenres: updatedGenres,
      };

      if (isEmailUser) {
        updates.firstName = formData.firstName;
        updates.lastName = formData.lastName;

        await updateProfile(auth.currentUser, {
          displayName: `${formData.firstName} ${formData.lastName}`
        });
      }

      await updateDoc(userDocRef, updates);

      setSelected(updatedGenres);

      if (isEmailUser) {
        await updateUserProfile(user.uid, {
          firstName: formData.firstName,
          lastName: formData.lastName
        });
      }

      setMessage({ text: 'Settings updated successfully!', type: 'success' });
    } catch (error) {
      console.error("Error updating settings:", error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (newPassword !== confirmNewPassword) {
        setMessage({ text: "New passwords don't match!", type: 'error' });
        setLoading(false);
        return;
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setShowPasswordUpdate(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === 'auth/wrong-password') {
        setMessage({ text: 'Current password is incorrect', type: 'error' });
      } else {
        setMessage({ text: `Error: ${error.message}`, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthReady || !user) {
    return (
      <div className="settings loading-container">
        <Header />
        <div className="loading-message">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="settings">
      <Header />
      <div className="settings-container">
        <div className="settings-box">
          <h1 className="settings-title">Account Settings</h1>

          {message.text && (
            <div className={message.type === 'error' ? "error-message" : "success-message"}>{message.text}</div>
          )}

          <div className="user-info-section">
            <h2>User Information</h2>
            {!isEmailUser && (
              <div className="auth-type-notice">You signed in with Google. Only email/password users can modify their name and password.</div>
            )}
          </div>

          <form className="settings-form" onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input className={`form-input ${!isEmailUser ? 'read-only' : ''}`} id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} disabled={!isEmailUser || loading} />
              {!isEmailUser && (<div className="input-note">Name can only be changed by email/password users</div>)}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input className={`form-input ${!isEmailUser ? 'read-only' : ''}`} id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} disabled={!isEmailUser || loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input className="form-input read-only" id="email" name="email" type="email" value={formData.email} disabled={true} readOnly />
            </div>

            {isEmailUser && !showPasswordUpdate && (
              <button type="button" className="password-button" onClick={() => setShowPasswordUpdate(true)} disabled={loading}>Change Password</button>
            )}

            {showPasswordUpdate && (
              <div className="password-form">
                <h2>Change Password</h2>

                <div className="form-group password-form-group">
                  <label className="form-label" htmlFor="currentPassword">Current Password</label>
                  <input className="form-input" id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={loading} required />
                </div>

                <div className="form-group password-form-group">
                  <label className="form-label" htmlFor="newPassword">New Password</label>
                  <input className="form-input" id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} required />
                </div>

                <div className="form-group password-form-group">
                  <label className="form-label" htmlFor="confirmNewPassword">Confirm New Password</label>
                  <input className="form-input" id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={loading} required />
                </div>

                <div className="password-buttons">
                  <button type="button" className="save-button" onClick={handlePasswordUpdate} disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
                  <button type="button" className="cancel-button" onClick={() => { setShowPasswordUpdate(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }} disabled={loading}>Cancel</button>
                </div>
              </div>
            )}

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

            <div className="settings-buttons">
              <button type="submit" className="save-button" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="back-button" onClick={() => navigate('/movies')} disabled={loading}>Back</button>
            </div>
          </form>
        </div>
      </div>

      <div className="purchase-history-container">
        <div className="purchase-history-content">
          <h2>Purchase History</h2>
          {previousPurchases && previousPurchases.length > 0 ? (
            <div className="purchase-items">
              {previousPurchases.map((item) => (
                <div key={item.id} className="purchase-item">
                  <img className="purchase-item-image" src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title} />
                  <h3 className="purchase-item-title">{item.title}</h3>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-purchases">You haven't made any purchases yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SettingsView;