import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Movie from './pages/Movie'
import TVShows from './pages/TVShows'
import TVShow from './pages/TVShow'
import NowShowing from './pages/NowShowing'
import { useLogin } from './context/LoginContext.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import Account from './pages/Account'


function App() {

  const { user, logout } = useLogin(); // Used by logout button

  return (
    <BrowserRouter>
      <nav>
        <Link to='/'>Home</Link>
        <Link to='/movies'>Movies</Link>
        <Link to='/tvshows'>TV Shows</Link>
        <Link to='/now-showing'>Now Showing</Link>

        {/*Only showing if user is logged in*/}
        {user && <Link to='/account'>Account</Link>}
        {user && <button onClick={logout}>Log out</button>}
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<Movie />} />
        <Route path='/tvshows' element={<TVShows />} />
        <Route path='/tvshows/:id' element={<TVShow />} />
        <Route path='/now-showing' element={<NowShowing />} />

        {/*Pages visible to only logged in users should be wrapped like this.*/}
        <Route path='/account' element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
