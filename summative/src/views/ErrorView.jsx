import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import './ErrorView.css';

function ErrorView() {
    const navigate = useNavigate();

    return (
        <div className="error">
            <Header />
            <div className="error-container">
                <h1>404</h1>
                <p>Page Not Found</p>
                <button onClick={() => navigate("/")}>Go Home</button>
            </div>
        </div>
    );
}

export default ErrorView;