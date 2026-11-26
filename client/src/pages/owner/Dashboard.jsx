import { useEffect, useState } from 'react';
import { api } from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/owner/dashboard').then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat"><span>{stats.total_clients}</span>Clients</div>
        <div className="stat"><span>{stats.total_cars}</span>Cars</div>
        <div className="stat"><span>{stats.cars_in_garage}</span>Repairs in progress</div>
        <div className="stat"><span>{stats.pending_appointments}</span>Pending appointments</div>
        <div className="stat"><span>${Number(stats.income_this_month).toFixed(2)}</span>Income this month</div>
      </div>
    </div>
  );
}
