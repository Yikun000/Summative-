import "./HomeView.css";
import Featured from '../components/Featured';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Hero from '../components/Hero';

function HomeView() {
    return (
        <div className="home">
            <Header />
            <Hero />
            <Featured />
            <Footer />
        </div>
    );
}

export default HomeView;