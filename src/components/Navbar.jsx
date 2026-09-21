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
      </div>

      {/* Login and Sign in links, visible only when not logged in */}
      {!user && (
      <div className="auth-links">
        <Link className="sign-in-button" to="/register">
          Sign in
        </Link>

        <Link className="login-button" to="/login">
          Login
        </Link>
      </div>
      )}

      {/*Links only visible to logged in users*/}
      {user && (
        <div className="user-links">

          <Link className="account-link" to="/account">
            <span className="account-icon-wrapper">
              <svg
                className="account-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </span>
          </Link>

          <button className="logout-button" onClick={logout}>
            <svg
              className="logout-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 3v18" />
            </svg>

            <span>Log out</span>
          </button>

        </div>
      )}
      


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