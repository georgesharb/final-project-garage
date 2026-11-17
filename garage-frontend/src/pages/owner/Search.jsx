import { useState } from 'react';
import { api, showDate } from '../../api';

// Type a plate or VIN -> see the car, its owner and all its repairs
export default function Search() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      setResult(await api('/owner/cars/search?q=' + encodeURIComponent(q.trim())));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Search a car</h1>
      <form className="search-bar" onSubmit={handleSearch}>
        <input placeholder="Plate number or VIN" value={q} onChange={(e) => setQ(e.target.value)} required />
        <button type="submit">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <>
          <div className="card">
            <h2>{result.car.brand} {result.car.model} ({result.car.year})</h2>
            <p>Plate: <b>{result.car.plate_number}</b> · VIN: <b>{result.car.vin}</b></p>
            <p>Owner: <b>{result.car.client_name}</b> · {result.car.client_phone}</p>
          </div>

          <h2>Repair history</h2>
          {result.repairs.length === 0 ? (
            <p className="muted">No repairs yet.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Date</th><th>Work done</th><th>Cost</th><th>Status</th></tr>
              </thead>
              <tbody>
                {result.repairs.map((r) => (
                  <tr key={r.id}>
                    <td>{showDate(r.repair_date)}</td>
                    <td>{r.description}</td>
                    <td>${Number(r.cost).toFixed(2)}</td>
                    <td><span className={'badge ' + r.status.replace(' ', '-')}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
