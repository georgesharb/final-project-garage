import { Link } from 'react-router-dom';

export default function HomeNavbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link className="brand" to="/">BlueLine <span>Garage</span></Link>

        <nav className="nav-links" aria-label="Main">
          <a href="#services">SERVICES</a>
          <a href="#about">ABOUT</a>
          <a href="#location">LOCATION</a>
        </nav>

        {user ? (
          <div className="nav-account">
            <Link className="nav-link" to={user.role === 'owner' ? '/owner' : '/client'}>MY ACCOUNT</Link>
            <button className="button button-line" onClick={onLogout}>LOG OUT</button>
          </div>
        ) : (
          <div className="nav-account">
            <Link className="nav-link" to="/login">LOG IN</Link>
            <Link className="button button-line" to="/register">SIGN UP</Link>
          </div>
        )}
      </div>
    </header>
  );
}
