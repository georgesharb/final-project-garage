import { Suspense } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../api';

// Sidebar + the current page (<Outlet />). Used by both owner and client.
export default function Layout({ title, links }) {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>🔧 {title}</h2>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <small>{user.email}</small>
          <button className="btn-light" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <main className="content">
        {/* the menu stays on screen while the next page loads */}
        <Suspense fallback={<p>Loading...</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
