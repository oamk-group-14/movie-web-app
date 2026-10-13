import HomeSection from '../components/HomeSection';

function Home() {
  return (
    <div className="media-page">
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