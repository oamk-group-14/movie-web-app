import { useState } from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/tvshows">TV Shows</Link>
        <Link to="/now-showing">Now Showing</Link>
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
        </div>
      )}
    </nav>
  )
}

export default Navbar