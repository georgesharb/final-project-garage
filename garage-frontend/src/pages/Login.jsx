import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, saveLogin } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message; // e.g. "Account created!" after sign-up
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [ownerExists, setOwnerExists] = useState(true);

  // Show the "set up owner" link only if no owner exists yet
  useEffect(() => {
    api('/auth/owner-exists').then((data) => setOwnerExists(data.exists));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/login', 'POST', form);
      saveLogin(data.token, data.user);
      // Owner goes to the owner panel, client to his space
      navigate(data.user.role === 'owner' ? '/owner' : '/client');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>🔧 Garage Manager</h1>
        <p className="muted">Log in as the owner or as a client</p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />

        <button type="submit">Log in</button>

        <p className="muted">
          New client? <Link to="/register">Create an account</Link>
        </p>
        {!ownerExists && (
          <p className="muted">
            First time? <Link to="/setup">Set up the owner account</Link>
          </p>
        )}

        {import.meta.env.VITE_DEMO === 'true' && (
          <p className="demo-hint">
            Demo accounts:<br />
            owner@garage.com / owner123<br />
            client@garage.com / client123
          </p>
        )}
      </form>
    </div>
  );
}
