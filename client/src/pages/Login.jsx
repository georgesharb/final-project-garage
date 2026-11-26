import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, saveLogin, loadDraft, saveDraft, clearDraft, EMAIL_PATTERN, EMAIL_HINT } from '../api';
import RoleChoice from '../components/RoleChoice';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message; // e.g. "Account created!" after sign-up
  // The draft (role + email) is read back from localStorage after a reload
  const [form, setForm] = useState(loadDraft('loginDraft', { role: 'client', email: '', password: '' }));
  const role = form.role;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); // true while waiting for the server

  function handleChange(e) {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    saveDraft('loginDraft', newForm); // saved without the password
  }

  function setRole(newRole) {
    handleChange({ target: { name: 'role', value: newRole } });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // The backend checks that this account really has the chosen role
      const data = await api('/auth/login', 'POST', form);
      saveLogin(data.token, data.user);
      clearDraft('loginDraft');
      navigate(role === 'owner' ? '/owner' : '/client');
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">🔧 WELCOME BACK!</h1>

        {message && <p className="success" role="status">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}

        <RoleChoice role={role} setRole={setRole} />

        <label htmlFor="login-email">Email</label>
        <input id="login-email" name="email" type="email" pattern={EMAIL_PATTERN} title={EMAIL_HINT} placeholder="email@example.com" value={form.email} onChange={handleChange} required />

        <label htmlFor="login-password">Password</label>
        <input id="login-password" name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />

        <button type="submit" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        {busy && <p className="muted">(The first request can take up to a minute: the free server wakes up.)</p>}

        <p className="muted">
          Need an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
