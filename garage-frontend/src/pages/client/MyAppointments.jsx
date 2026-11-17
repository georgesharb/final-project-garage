import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, showDateTime } from '../../api';

const emptyForm = { car_id: '', appointment_date: '', note: '' };

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function loadAppointments() {
    setAppointments(await api('/me/appointments'));
  }

  useEffect(() => {
    loadAppointments();
    api('/me/cars').then(setCars);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/me/appointments', 'POST', form);
      setForm(emptyForm);
      loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  // Answer the owner's proposed date
  async function respond(id, accept) {
    await api(`/me/appointments/${id}/respond`, 'PATCH', { accept });
    loadAppointments();
  }

  return (
    <div>
      <h1>Appointments</h1>

      {/* Rule: you need at least one car to book */}
      {cars.length === 0 ? (
        <p className="card">You need a car to book. <Link to="/client/cars">Add your car first</Link>.</p>
      ) : (
        <form className="card form-grid" onSubmit={handleSubmit}>
          <h2>Book an appointment</h2>
          <select name="car_id" value={form.car_id} onChange={handleChange} required>
            <option value="">-- Choose your car * --</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.plate_number})</option>
            ))}
          </select>
          <input name="appointment_date" type="datetime-local" value={form.appointment_date} onChange={handleChange} required />
          <input name="note" placeholder="What's the problem?" value={form.note} onChange={handleChange} />
          <div className="form-actions">
            <button type="submit">Book</button>
          </div>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      <h2>My history</h2>
      <table>
        <thead><tr><th>Date</th><th>Car</th><th>Note</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td>{showDateTime(a.appointment_date)}</td>
              <td>{a.brand} {a.model} ({a.plate_number})</td>
              <td>{a.note}</td>
              <td><span className={'badge ' + a.status}>{a.status}</span></td>
              <td className="actions">
                {a.status === 'proposed' && (
                  <>
                    <span>New date: <b>{showDateTime(a.proposed_date)}</b></span>
                    <button onClick={() => respond(a.id, true)}>Accept</button>
                    <button className="btn-danger" onClick={() => respond(a.id, false)}>Decline</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
