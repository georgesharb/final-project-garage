import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, logout } from '../../api';
import InfoSection from './InfoSection';
import CarsSection from './CarsSection';
import AppointmentsSection from './AppointmentsSection';
import RepairsSection from './RepairsSection';

// The client has ONE page with everything on it (no tabs).
export default function ClientHome() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [cars, setCars] = useState([]); // shared: the cars list AND the booking dropdown use it
  const [error, setError] = useState('');

  async function loadCars() {
    setCars(await api('/me/cars'));
  }

  useEffect(() => {
    api('/me').then(setMe).catch((err) => setError(err.message));
    loadCars().catch((err) => setError(err.message));
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (error) return <p className="client-content error">{error}</p>;
  if (!me) return <p className="client-content">Loading...</p>;

  return (
    <div className="client-page">
      <header className="client-header">
        <h2>🔧 My garage</h2>
        <div>
          <span className="muted">{me.email}</span>
          <button className="btn-light" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main className="client-content">
        <h1>Hello, {me.name}</h1>
        <InfoSection me={me} />
        <CarsSection cars={cars} onCarAdded={loadCars} />
        <AppointmentsSection cars={cars} />
        <RepairsSection />
      </main>
    </div>
  );
}
