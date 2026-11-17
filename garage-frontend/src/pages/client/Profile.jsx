import { useEffect, useState } from 'react';
import { api } from '../../api';

export default function Profile() {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/me').then((me) =>
      setForm({ name: me.name, phone: me.phone || '', address: me.address || '' })
    );
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api('/me', 'PUT', form);
      setMessage('Saved!');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>My profile</h1>
      <form className="card form-grid" onSubmit={handleSubmit}>
        <input name="name" placeholder="Full name *" value={form.name} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <div className="form-actions">
          <button type="submit">Save</button>
        </div>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
