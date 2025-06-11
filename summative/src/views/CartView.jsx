import './CartView.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useStoreContext } from '../context/index.jsx';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CartView() {
  const { cart, setCart, handleCheckout, user } = useStoreContext();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const removeFromCart = (movieId) => {
    const updatedCart = cart.filter(item => item.id !== movieId);
    setCart(updatedCart);
  };

  const processCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setLoading(true);
    try {
      const success = await handleCheckout();
      if (success) {
        setCheckoutSuccess(true);
        setTimeout(() => {
          setCheckoutSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='cart'>
      <Header />
      <div className="cart-header">
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        <h1 className="cart-title">Your Cart</h1>
      </div>

      {checkoutSuccess && (
        <div className="checkout-success-message">Purchase completed successfully! Thank you for your order.</div>
      )}

      <div className="cart-items-container">
        {cart.length > 0 ? (
          <>
            <div className="cart-items">
              {cart.map(movie => (
                <div key={movie.id} className="cart-item">
                  <Link to={`/movies/details/${movie.id}`}>
                    <img className="cart-item-image" src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
                  </Link>
                  <h2 className="cart-item-title">{movie.title}</h2>
                  <button className="cart-item-button" onClick={() => removeFromCart(movie.id)} disabled={loading}>Remove</button>
                </div>
              ))}
            </div>
            <div className="checkout-container">
              <button className="checkout-button" onClick={processCheckout} disabled={loading}>
                {loading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </>
        ) : (
          <p className="empty-cart-message">Your cart is empty</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default CartView;