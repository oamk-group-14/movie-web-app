import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Movie from './pages/Movie'
import TVShows from './pages/TVShows'
import TVShow from './pages/TVShow'
import NowShowing from './pages/NowShowing'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<Movie />} />
        <Route path='/tvshows' element={<TVShows />} />
        <Route path='/tvshows/:id' element={<TVShow />} />
        <Route path='/now-showing' element={<NowShowing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
