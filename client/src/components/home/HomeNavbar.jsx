import { Link } from 'react-router-dom';

// Top bar of the main page. It stays at the top while scrolling (see .navbar in home.css).
export default function HomeNavbar({ name, accent, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* the garage name brings you back to the top of the page */}
        <a className="brand" href="#top">{name} <span>{accent}</span></a>

        <nav className="nav-links" aria-label="Main">
          <a href="#services">SERVICES</a>
          <a href="#about">ABOUT US</a>
          <a href="#visit">VISIT US</a>
        </nav>

        {user ? (
          <div className="nav-account">
            <Link className="nav-link" to={user.role === 'owner' ? '/owner' : '/client'}>MY ACCOUNT</Link>
            <button className="button button-small" onClick={onLogout}>LOG OUT</button>
          </div>
        ) : (
          // only "Log in": the login page has a link to sign up
          <Link className="button button-small" to="/login">LOG IN</Link>
        )}
      </div>
    </header>
  );
}
