import { useEffect, useState } from 'react';
import { api, showDate } from '../../api';

// The client's repair history (read only: only the owner adds repairs)
export default function RepairsSection() {
  const [repairs, setRepairs] = useState(null); // null = still loading
  const [error, setError] = useState('');

  useEffect(() => {
    api('/me/repairs').then(setRepairs).catch((err) => setError(err.message));
  }, []);

  if (error) return <section className="card"><p className="error">{error}</p></section>;
  if (!repairs) return <section className="card"><p>Loading...</p></section>;

  // Only finished repairs count (a repair "in progress" is not paid yet)
  const total = repairs
    .filter((r) => r.status === 'done')
    .reduce((sum, r) => sum + Number(r.cost), 0);

  return (
    <section className="card">
      <h2>Repair history</h2>

      {repairs.length === 0 ? (
        <p className="muted">No repairs yet.</p>
      ) : (
        <>
          <p>Total spent (finished repairs): <b>${total.toFixed(2)}</b></p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Car</th><th>Work done</th><th>Price</th><th>Status</th></tr></thead>
              <tbody>
                {repairs.map((r) => (
                  <tr key={r.id}>
                    <td>{showDate(r.date)}</td>
                    <td>{r.brand} {r.model}</td>
                    <td>{r.description}</td>
                    <td>${Number(r.cost).toFixed(2)}</td>
                    <td><span className={'badge ' + r.status.replace(' ', '-')}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
