import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, loadDraft, saveDraft, clearDraft, EMAIL_PATTERN, EMAIL_HINT, PHONE_PATTERN, PHONE_HINT } from '../api';

// Sign up is for CLIENTS only.
// (The owner account is created once with the command: npm run create-owner)
export default function Register() {
  const navigate = useNavigate();
  // The draft is read back from localStorage after a reload (never the password)
  const [form, setForm] = useState(loadDraft('signupDraft', { name: '', phone: '', email: '', password: '' }));
  const [error, setError] = useState('');

  function handleChange(e) {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    saveDraft('signupDraft', newForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/register', 'POST', form);
      clearDraft('signupDraft');
      navigate('/login', { state: { message: data.message } });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">🔧 SIGN UP</h1>

        {error && <p className="error" role="alert">{error}</p>}

        <label htmlFor="register-name">Name</label>
        <input id="register-name" name="name" value={form.name} onChange={handleChange} required />

        <label htmlFor="register-phone">Phone</label>
        <input id="register-phone" name="phone" type="tel" inputMode="tel" pattern={PHONE_PATTERN} title={PHONE_HINT} placeholder="03 123 456" value={form.phone} onChange={handleChange} required />

        <label htmlFor="register-email">Email</label>
        <input id="register-email" name="email" type="email" pattern={EMAIL_PATTERN} title={EMAIL_HINT} placeholder="email@example.com" value={form.email} onChange={handleChange} required />

        <label htmlFor="register-password">Password</label>
        <input id="register-password" name="password" type="password" minLength={6} placeholder="At least 6 characters" value={form.password} onChange={handleChange} required />

        <button type="submit">Sign up</button>

        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
