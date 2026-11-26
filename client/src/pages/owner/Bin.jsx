import { useEffect, useState } from 'react';
import { api, showDate } from '../../api';

// Deleted clients, cars and repairs. Nothing is lost: the owner can restore them.
export default function Bin() {
  const [bin, setBin] = useState(null); // null = still loading
  const [error, setError] = useState('');

  async function loadBin() {
    setBin(await api('/owner/bin'));
  }

  useEffect(() => {
    loadBin();
  }, []);

  // type = 'clients' | 'cars' | 'repairs'
  async function restore(type, id) {
    setError('');
    try {
      await api(`/owner/bin/${type}/${id}/restore`, 'PATCH');
      loadBin();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!bin) return <p>Loading...</p>;

  const isEmpty = bin.clients.length + bin.cars.length + bin.repairs.length === 0;

  return (
    <div>
      <h1>Bin</h1>
      {error && <p className="error">{error}</p>}
      {isEmpty && <p className="muted">The bin is empty.</p>}

      {bin.clients.length > 0 && (
        <>
          <h2>Clients</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Deleted on</th><th></th></tr></thead>
              <tbody>
                {bin.clients.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>{showDate(c.deleted_at)}</td>
                    <td className="actions"><button onClick={() => restore('clients', c.id)}>Restore</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {bin.cars.length > 0 && (
        <>
          <h2>Cars</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Car</th><th>VIN</th><th>Plate</th><th>Owner</th><th>Deleted on</th><th></th></tr></thead>
              <tbody>
                {bin.cars.map((car) => (
                  <tr key={car.id}>
                    <td>{car.brand} {car.model} {car.year}</td>
                    <td>{car.vin}</td>
                    <td>{car.plate_number || '-'}</td>
                    <td>{car.client_name}</td>
                    <td>{showDate(car.deleted_at)}</td>
                    <td className="actions"><button onClick={() => restore('cars', car.id)}>Restore</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {bin.repairs.length > 0 && (
        <>
          <h2>Repairs</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Car</th><th>Client</th><th>Work done</th><th>Price</th><th>Deleted on</th><th></th></tr></thead>
              <tbody>
                {bin.repairs.map((r) => (
                  <tr key={r.id}>
                    <td>{showDate(r.date)}</td>
                    <td>{r.brand} {r.model}</td>
                    <td>{r.client_name}</td>
                    <td>{r.description}</td>
                    <td>${Number(r.cost).toFixed(2)}</td>
                    <td>{showDate(r.deleted_at)}</td>
                    <td className="actions"><button onClick={() => restore('repairs', r.id)}>Restore</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
