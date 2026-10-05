import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Movie from './pages/Movie'
import TVShows from './pages/TVShows'
import TVShow from './pages/TVShow'
import NowShowing from './pages/NowShowing'
import Account from './pages/Account'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Favorites from './pages/Favorites.jsx'
import Groups from './pages/Groups.jsx'
import NewGroup from './pages/NewGroup.jsx'
import Group from './pages/Group.jsx'


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
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<Group />} />


        {/*Pages visible to only logged in users should be wrapped like this.*/}
        <Route path='/account' element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />

        <Route path='/favorites' element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        } />

        <Route path="/groups/new" element={
          <ProtectedRoute>
            <NewGroup />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App
