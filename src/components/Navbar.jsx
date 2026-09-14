import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../context/LoginContext.jsx'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useLogin();

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/tvshows">TV Shows</Link>
        <Link to="/now-showing">Now Showing</Link>
        <Link to='/genres'>Genres</Link>
        {/*Links only visible to logged in users*/}
        {user && <Link to='/account'>Account</Link>}
        {user && <button onClick={logout}>Log out</button>}
      </div>

      {/* Hamburger menu mobile + tablet */}
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <Link to="/movies" onClick={() => setMenuOpen(false)}>
            Movies
          </Link>

          <Link to="/tvshows" onClick={() => setMenuOpen(false)}>
            TV Shows
          </Link>

          <Link to="/now-showing" onClick={() => setMenuOpen(false)}>
            Now Showing
          </Link>

          {/*Links only visible to logged in users*/}

          {user && (
            <Link to='/account' onClick={() => setMenuOpen(false)}>
              Account
            </Link>
          )}

          {user && (
            <button onClick={() => { logout(); setMenuOpen(false); }}>
              Log out
            </button>
          )}

        </div>
      )}
    </nav>
  )
}

export default Navbar