import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Movie from './pages/Movie'
import TVShows from './pages/TVShows'
import TVShow from './pages/TVShow'
import Genres from './pages/Genre'

function App() {
  return (
    <BrowserRouter> 
      <nav>
        <Link to='/'>Home</Link>
        <Link to='/movies'>Movies</Link>
        <Link to='/tvshows'>TV Shows</Link>
        <Link to='/genres'>Genres</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/movies' element={<Movies/>}/>
        <Route path='/movies/:id' element={<Movie/>}/>
        <Route path='/tvshows' element={<TVShows/>}/>
        <Route path='/tvshows/:id' element={<TVShow/>}/>
        <Route path='/genres' element={<Genres/>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default App
