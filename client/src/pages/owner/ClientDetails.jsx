import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, showDate } from '../../api';

// One client: info, cars, repair history and total spent
export default function ClientDetails() {
  const { id } = useParams(); // the :id in the URL
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/owner/clients/' + id).then(setData).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;

  const { client, cars, repairs, total_spent } = data;

  return (
    <div>
      <Link to="/owner/clients">← Back to clients</Link>
      <h1>{client.name}</h1>

      <div className="stats">
        <div className="stat"><span>{cars.length}</span>Cars</div>
        <div className="stat"><span>{repairs.length}</span>Repairs</div>
        <div className="stat"><span>${Number(total_spent).toFixed(2)}</span>Total spent (done)</div>
      </div>

      <div className="card">
        <p>📞 {client.phone} · ✉️ {client.email}</p>
      </div>

      <h2>Cars</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Car</th><th>Plate</th><th>VIN</th></tr></thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id}>
                <td>{car.brand} {car.model} {car.year}</td>
                <td>{car.plate_number || '-'}</td>
                <td>{car.vin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Repair history</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Car</th><th>Work done</th><th>Cost</th><th>Status</th></tr></thead>
          <tbody>
            {repairs.map((r) => (
              <tr key={r.id}>
                <td>{showDate(r.date)}</td>
                <td>{r.brand} {r.model} ({r.plate_number || r.vin})</td>
                <td>{r.description}</td>
                <td>${Number(r.cost).toFixed(2)}</td>
                <td><span className={'badge ' + r.status.replace(' ', '-')}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
