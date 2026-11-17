import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

// One-time owner sign-up. The backend refuses it once an owner exists.
export default function OwnerSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/auth/register-owner', 'POST', form);
      navigate('/login', { state: { message: 'Owner account created! Please log in.' } });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Owner setup</h1>
        <p className="muted">This can only be done once.</p>

        {error && <p className="error">{error}</p>}

        <label>Owner email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Password</label>
        <input name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />

        <button type="submit">Create owner account</button>
        <p className="muted"><Link to="/login">Back to login</Link></p>
      </form>
    </div>
  );
}
