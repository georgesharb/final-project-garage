import { useEffect, useState } from 'react';
import { api, confirmDelete, showDate } from '../../api';

const emptyForm = { car_id: '', description: '', cost: '', repair_date: '', status: 'in progress' };

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [cars, setCars] = useState([]); // for the "Car" dropdown
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  async function loadRepairs() {
    setRepairs(await api('/owner/repairs?status=' + statusFilter));
  }

  useEffect(() => {
    loadRepairs();
  }, [statusFilter]);

  useEffect(() => {
    api('/owner/cars').then(setCars);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await api('/owner/repairs/' + editId, 'PUT', form);
      } else {
        await api('/owner/repairs', 'POST', form);
      }
      cancelEdit();
      loadRepairs();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(r) {
    setEditId(r.id);
    setForm({
      car_id: r.car_id,
      description: r.description,
      cost: r.cost,
      repair_date: showDate(r.repair_date),
      status: r.status
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirmDelete('Delete this repair?')) return;
    setError('');
    try {
      await api('/owner/repairs/' + id, 'DELETE');
      loadRepairs();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Repairs</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <h2>{editId ? 'Edit repair' : 'Record a repair'}</h2>
        {/* The car can't change after creation: the repair is billed to its owner */}
        <select name="car_id" value={form.car_id} onChange={handleChange} required disabled={editId}>
          <option value="">-- Car * --</option>
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.plate_number} · {c.brand} {c.model} ({c.client_name})
            </option>
          ))}
        </select>
        <input name="description" placeholder="Work done *" value={form.description} onChange={handleChange} required />
        <input name="cost" type="number" step="0.01" min="0" placeholder="Cost ($)" value={form.cost} onChange={handleChange} />
        <input name="repair_date" type="date" value={form.repair_date} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="in progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <div className="form-actions">
          <button type="submit">{editId ? 'Save changes' : 'Add repair'}</button>
          {editId && <button type="button" className="btn-light" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <select className="filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All statuses</option>
        <option value="in progress">In progress</option>
        <option value="done">Done</option>
      </select>

      <table>
        <thead>
          <tr><th>Date</th><th>Car</th><th>Client</th><th>Work done</th><th>Cost</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {repairs.map((r) => (
            <tr key={r.id}>
              <td>{showDate(r.repair_date)}</td>
              <td>{r.brand} {r.model} ({r.plate_number})</td>
              <td>{r.client_name}</td>
              <td>{r.description}</td>
              <td>${Number(r.cost).toFixed(2)}</td>
              <td><span className={'badge ' + r.status.replace(' ', '-')}>{r.status}</span></td>
              <td className="actions">
                <button className="btn-light" onClick={() => startEdit(r)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
