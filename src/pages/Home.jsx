import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeSection from '../components/HomeSection';

function Home() {
    const location = useLocation();
    const navigate = useNavigate();

    // Message passed from another page, for example "Account was deleted successfully"
    const [notice, setNotice] = useState(location.state?.message || '');

    // Clear the message from history so it doesn't show again on refresh
    useEffect(() => {
        if (location.state?.message) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location, navigate]);

    // Hide the notice after 5 seconds
    useEffect(() => {
        if (!notice) return;

        const timer = setTimeout(() => setNotice(''), 5000);
        return () => clearTimeout(timer);
    }, [notice]);

    return (
        <div className="media-page">
            {notice && (
                <div className="notice" role="status">
                    {notice}
                </div>
            )}

            <HomeSection
                title="Popular movies"
                endpoint="http://localhost:3000/api/movies/popular"
                type="movie"
                seeAllLink="/movies"
            />

            <HomeSection
                title="Popular TV shows"
                endpoint="http://localhost:3000/api/tvshows/popular"
                type="tv"
                seeAllLink="/tvshows"
            />

            <HomeSection
                title="Now in theaters"
                endpoint="http://localhost:3000/api/movies/now-showing"
                type="movie"
                seeAllLink="/now-showing"
            />
        </div>
    );
}

export default Home;