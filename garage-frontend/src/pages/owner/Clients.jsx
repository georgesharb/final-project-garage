import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, confirmDelete } from '../../api';

const emptyForm = { name: '', phone: '', email: '', address: '' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null); // null = adding, a number = editing
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function loadClients() {
    setClients(await api('/owner/clients?search=' + encodeURIComponent(search)));
  }

  // Reload the list every time the search text changes
  useEffect(() => {
    loadClients();
  }, [search]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await api('/owner/clients/' + editId, 'PUT', form);
      } else {
        await api('/owner/clients', 'POST', form);
      }
      cancelEdit();
      loadClients();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(client) {
    setEditId(client.id);
    setForm({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || ''
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirmDelete('Delete this client?')) return;
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

      <form className="card form-grid" onSubmit={handleSubmit}>
        <h2>{editId ? 'Edit client' : 'Add a client'}</h2>
        <input name="name" placeholder="Full name *" value={form.name} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <div className="form-actions">
          <button type="submit">{editId ? 'Save changes' : 'Add client'}</button>
          {editId && <button type="button" className="btn-light" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <input className="filter" placeholder="Search by name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <table>
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Email</th><th>Account</th><th></th></tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td><Link to={'/owner/clients/' + c.id}>{c.name}</Link></td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>{c.user_id ? 'Yes' : 'No'}</td>
              <td className="actions">
                <button className="btn-light" onClick={() => startEdit(c)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
