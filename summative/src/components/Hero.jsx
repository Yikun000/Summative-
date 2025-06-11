import './Hero.css';
import heroImage from '../assets/slowbro.jpg';

function Hero() {
  return (
    <div className='hero' id='hero'>
      <img className="hero-image" src={heroImage} alt="Hero Image" />
      <div className="hero-content">
        <h2>Welcome to WOOFLIX!</h2>
      </div>
    </div>
  );
}

export default Hero;