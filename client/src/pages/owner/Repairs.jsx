import { useEffect, useState } from 'react';
import { api, showDate } from '../../api';
import DeleteButton from '../../components/DeleteButton';

const today = () => new Date().toISOString().slice(0, 10);
const emptyLine = { description: '', cost: '' };
const emptyForm = { car_id: '', date: today(), status: 'in progress', items: [emptyLine] };

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [cars, setCars] = useState([]); // for the "Car" dropdown
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null); // editing = one repair only
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Load the repairs with the chosen status.
  // "refresh" changes after every add / edit / delete, so the list is loaded again.
  useEffect(() => {
    let ignore = false; // true if a newer request started (avoids showing an old answer)
    api('/owner/repairs?status=' + statusFilter)
      .then((data) => { if (!ignore) setRepairs(data); })
      .catch((err) => setError(err.message));
    return () => { ignore = true; };
  }, [statusFilter, refresh]);

  // Ask the effect above to load the list again
  function loadRepairs() {
    setRefresh((n) => n + 1);
  }

  useEffect(() => {
    api('/owner/cars').then(setCars).catch((err) => setError(err.message));
  }, []);

  // car, date, status
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // one repair line (description or cost) at position "index"
  function handleLineChange(index, e) {
    const items = form.items.map((item, i) =>
      i === index ? { ...item, [e.target.name]: e.target.value } : item
    );
    setForm({ ...form, items });
  }

  function addLine() {
    setForm({ ...form, items: [...form.items, emptyLine] });
  }

  function removeLine(index) {
    setForm({ ...form, items: form.items.filter((item, i) => i !== index) });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        const line = form.items[0];
        await api('/owner/repairs/' + editId, 'PUT', {
          description: line.description,
          cost: line.cost,
          date: form.date,
          status: form.status
        });
      } else {
        await api('/owner/repairs', 'POST', form); // all lines saved at once
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
      date: showDate(r.date),
      status: r.status,
      items: [{ description: r.description, cost: r.cost }]
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    setError('');
    try {
      await api('/owner/repairs/' + id, 'DELETE');
      loadRepairs();
    } catch (err) {
      setError(err.message);
    }
  }

  const total = form.items.reduce((sum, item) => sum + Number(item.cost || 0), 0);

  return (
    <div>
      <h1>Repairs</h1>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <h2>{editId ? 'Edit repair' : 'Record repairs'}</h2>

        {/* The car can't change after creation: the repair is billed to its owner */}
        <select aria-label="Car" name="car_id" value={form.car_id} onChange={handleChange} required disabled={editId}>
          <option value="">-- Car * --</option>
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.brand} {c.model} · {c.plate_number || c.vin} ({c.client_name})
            </option>
          ))}
        </select>
        <input aria-label="Repair date" name="date" type="date" value={form.date} onChange={handleChange} required />
        <select aria-label="Repair status" name="status" value={form.status} onChange={handleChange} required>
          <option value="in progress">In progress</option>
          <option value="done">Done</option>
        </select>

        {/* One line per repair: description + price */}
        <div className="repair-lines">
          {form.items.map((item, index) => (
            <div className="repair-line" key={index}>
              <input aria-label="Work done" name="description" placeholder="Work done *" value={item.description} onChange={(e) => handleLineChange(index, e)} required />
              <input aria-label="Price" name="cost" type="number" step="0.01" min="0" placeholder="Price ($) *" value={item.cost} onChange={(e) => handleLineChange(index, e)} required />
              {form.items.length > 1 && (
                <button type="button" className="btn-light" onClick={() => removeLine(index)}>✕</button>
              )}
            </div>
          ))}
          {!editId && (
            <button type="button" className="btn-light" onClick={addLine}>+ Add another repair</button>
          )}
        </div>

        <div className="form-actions">
          <button type="submit">{editId ? 'Save changes' : `Save ${form.items.length} repair(s) · $${total.toFixed(2)}`}</button>
          {editId && <button type="button" className="btn-light" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <select aria-label="Filter by status" className="filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All statuses</option>
        <option value="in progress">In progress</option>
        <option value="done">Done</option>
      </select>

      {repairs.length === 0 ? (
        <p className="muted">No repairs yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Car</th><th>Client</th><th>Work done</th><th>Price</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {repairs.map((r) => (
                <tr key={r.id}>
                  <td>{showDate(r.date)}</td>
                  <td>{r.brand} {r.model} ({r.plate_number || r.vin})</td>
                  <td>{r.client_name}</td>
                  <td>{r.description}</td>
                  <td>${Number(r.cost).toFixed(2)}</td>
                  <td><span className={'badge ' + r.status.replace(' ', '-')}>{r.status}</span></td>
                  <td className="actions">
                    <button className="btn-light" onClick={() => startEdit(r)}>Edit</button>
                    <DeleteButton onDelete={() => handleDelete(r.id)} />
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
