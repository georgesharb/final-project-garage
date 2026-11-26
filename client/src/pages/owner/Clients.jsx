import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EMAIL_PATTERN, EMAIL_HINT, PHONE_PATTERN, PHONE_HINT } from '../../api';
import DeleteButton from '../../components/DeleteButton';

// The owner sees, edits and deletes clients.
// He does NOT add clients: clients sign up themselves.
export default function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(null); // null = no client being edited
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Load the clients again every time the search text changes.
  // "refresh" changes after every add / edit / delete, so the list is loaded again.
  useEffect(() => {
    let ignore = false; // true if a newer request started (avoids showing an old answer)
    api('/owner/clients?name=' + encodeURIComponent(search))
      .then((data) => { if (!ignore) setClients(data); })
      .catch((err) => setError(err.message));
    return () => { ignore = true; };
  }, [search, refresh]);

  // Ask the effect above to load the list again
  function loadClients() {
    setRefresh((n) => n + 1);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/owner/clients/' + editId, 'PUT', form);
      cancelEdit();
      loadClients();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(client) {
    setEditId(client.id);
    setForm({ name: client.name, phone: client.phone, email: client.email });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(null);
  }

  async function handleDelete(id) {
    setError('');
    try {
      await api('/owner/clients/' + id, 'DELETE');
      loadClients();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Clients</h1>
      <p className="muted">Clients create their own account with Sign up.</p>

      {/* The edit form only shows after clicking "Edit" */}
      {form && (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <h2>Edit client</h2>
          <input aria-label="Full name" name="name" placeholder="Full name *" value={form.name} onChange={handleChange} required />
          <input aria-label="Phone" name="phone" type="tel" inputMode="tel" pattern={PHONE_PATTERN} title={PHONE_HINT} placeholder="Phone *" value={form.phone} onChange={handleChange} required />
          <input aria-label="Email" name="email" type="email" pattern={EMAIL_PATTERN} title={EMAIL_HINT} placeholder="Email (also his login) *" value={form.email} onChange={handleChange} required />
          <div className="form-actions">
            <button type="submit">Save changes</button>
            <button type="button" className="btn-light" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      <input aria-label="Search by name" className="filter" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {clients.length === 0 ? (
        <p className="muted">No clients found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th></th></tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td><Link to={'/owner/clients/' + c.id}>{c.name}</Link></td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td className="actions">
                    <button className="btn-light" onClick={() => startEdit(c)}>Edit</button>
                    <DeleteButton onDelete={() => handleDelete(c.id)} />
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
