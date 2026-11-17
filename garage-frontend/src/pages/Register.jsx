import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

// Public sign-up for CLIENTS
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/auth/register', 'POST', form);
      navigate('/login', { state: { message: 'Account created! You can now log in.' } });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Create a client account</h1>

        {error && <p className="error">{error}</p>}

        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Password</label>
        <input name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />

        <button type="submit">Sign up</button>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
