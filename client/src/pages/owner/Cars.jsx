import { useEffect, useState } from 'react';
import { api, decodeVin } from '../../api';
import DeleteButton from '../../components/DeleteButton';

const emptyForm = { client_id: '', brand: '', model: '', year: '', vin: '', plate_number: '' };

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [clients, setClients] = useState([]); // for the "Owner" dropdown
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function loadCars() {
    setCars(await api('/owner/cars'));
  }

  useEffect(() => {
    loadCars();
    api('/owner/clients').then(setClients).catch((err) => setError(err.message));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await api('/owner/cars/' + editId, 'PUT', form);
      } else {
        await api('/owner/cars', 'POST', form);
      }
      cancelEdit();
      loadCars();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(car) {
    setEditId(car.id);
    setForm({
      client_id: car.client_id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      vin: car.vin,
      plate_number: car.plate_number || ''
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  // "Fill from VIN": brand, model and year come from the free NHTSA API (through our backend)
  async function fillFromVin() {
    setError('');
    try {
      const car = await decodeVin(form.vin);
      setForm({ ...form, brand: car.brand, model: car.model, year: car.year || form.year });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await api('/owner/cars/' + id, 'DELETE');
      loadCars();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Cars</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <h2>{editId ? 'Edit car' : 'Add a car'}</h2>
        <select aria-label="Client" name="client_id" value={form.client_id} onChange={handleChange} required>
          <option value="">-- Owner (client) * --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input aria-label="VIN (17 characters)" name="vin" placeholder="VIN (17 characters) *" minLength={17} maxLength={17} value={form.vin} onChange={handleChange} required />
        <button type="button" className="btn-light" onClick={fillFromVin} disabled={form.vin.trim().length !== 17}>
          Fill from VIN
        </button>
        <input aria-label="Brand" name="brand" placeholder="Brand *" value={form.brand} onChange={handleChange} required />
        <input aria-label="Model" name="model" placeholder="Model *" value={form.model} onChange={handleChange} required />
        <input aria-label="Year" name="year" type="number" placeholder="Year *" value={form.year} onChange={handleChange} required />
        <input aria-label="Plate number" name="plate_number" placeholder="Plate number (optional)" value={form.plate_number} onChange={handleChange} />
        <div className="form-actions">
          <button type="submit">{editId ? 'Save changes' : 'Add car'}</button>
          {editId && <button type="button" className="btn-light" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {cars.length === 0 ? (
        <p className="muted">No cars yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Car</th><th>Year</th><th>Plate</th><th>VIN</th><th>Owner</th><th></th></tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id}>
                  <td>{car.brand} {car.model}</td>
                  <td>{car.year}</td>
                  <td>{car.plate_number || '-'}</td>
                  <td>{car.vin}</td>
                  <td>{car.client_name}</td>
                  <td className="actions">
                    <button className="btn-light" onClick={() => startEdit(car)}>Edit</button>
                    <DeleteButton onDelete={() => handleDelete(car.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
