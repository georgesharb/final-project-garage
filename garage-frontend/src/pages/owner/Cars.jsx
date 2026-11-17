import { useEffect, useState } from 'react';
import { api, confirmDelete } from '../../api';

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
    api('/owner/clients').then(setClients);
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
      year: car.year || '',
      vin: car.vin,
      plate_number: car.plate_number
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirmDelete('Delete this car?')) return;
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
        <select name="client_id" value={form.client_id} onChange={handleChange} required>
          <option value="">-- Owner (client) * --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="brand" placeholder="Brand *" value={form.brand} onChange={handleChange} required />
        <input name="model" placeholder="Model *" value={form.model} onChange={handleChange} required />
        <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} />
        <input name="vin" placeholder="VIN (chassis no.) *" maxLength={17} value={form.vin} onChange={handleChange} required />
        <input name="plate_number" placeholder="Plate number *" value={form.plate_number} onChange={handleChange} required />
        <div className="form-actions">
          <button type="submit">{editId ? 'Save changes' : 'Add car'}</button>
          {editId && <button type="button" className="btn-light" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr><th>Car</th><th>Year</th><th>Plate</th><th>VIN</th><th>Owner</th><th></th></tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.id}>
              <td>{car.brand} {car.model}</td>
              <td>{car.year}</td>
              <td>{car.plate_number}</td>
              <td>{car.vin}</td>
              <td>{car.client_name}</td>
              <td className="actions">
                <button className="btn-light" onClick={() => startEdit(car)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(car.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
