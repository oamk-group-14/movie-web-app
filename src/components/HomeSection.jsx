import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MediaCard from './MediaCard';

// Shows one row of movies or TV shows with a link to the full page.
function HomeSection({ title, endpoint, type, seeAllLink }) {
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        const loadItems = async () => {
            try {
                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error('Fetch failed');
                }

                const data = await response.json();
                if (!ignore) setItems(data.slice(0, 5));
            } catch (error) {
                console.error(`Error loading ${title}:`, error);
                if (!ignore) setError('Unable to load');
            }
        };

        loadItems();

        return () => { ignore = true; };
    }, [endpoint, title]);

    return (
        <section className="home-section">
            <div className="home-section-header">
                <h2>{title}</h2>
                <Link to={seeAllLink}>See all</Link>
            </div>

            {error ? (
                <p>{error}</p>
            ) : (
                <div className="media-grid home-row">
                    {items.map((item) => (
                        <MediaCard
                            key={`${type}-${item.id}`}
                            id={item.id}
                            title={item.title}
                            posterUrl={item.posterUrl}
                            date={item.year}
                            rating={item.voteAverage}
                            type={type}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default HomeSection;