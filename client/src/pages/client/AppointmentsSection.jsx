import { useEffect, useState } from 'react';
import { api, showDateTime } from '../../api';
import { services } from '../../homeData'; // for the "Service" dropdown

const emptyForm = { car_id: '', service_requested: '', preferred_datetime: '', notes: '' };

export default function AppointmentsSection({ cars }) {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function loadAppointments() {
    setAppointments(await api('/me/appointments'));
  }

  useEffect(() => {
    loadAppointments();
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

  // Answer the owner's proposed date (status "rescheduled")
  async function respond(id, accept) {
    await api(`/me/appointments/${id}/respond`, 'PATCH', { accept });
    loadAppointments();
  }

  return (
    <section className="card">
      <h2>Appointments</h2>

      {/* Rule: you need at least one car to book */}
      {cars.length === 0 ? (
        <p className="muted">Add a car first to book an appointment.</p>
      ) : (
        <form className="form-grid" onSubmit={handleSubmit}>
          <select aria-label="Car" name="car_id" value={form.car_id} onChange={handleChange} required>
            <option value="">-- Choose your car * --</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.plate_number || c.vin})</option>
            ))}
          </select>
          <select aria-label="Service" name="service_requested" value={form.service_requested} onChange={handleChange} required>
            <option value="">-- Service * --</option>
            {services.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <input aria-label="Preferred date and time" name="preferred_datetime" type="datetime-local" value={form.preferred_datetime} onChange={handleChange} required />
          <input aria-label="Notes" name="notes" placeholder="Notes (what's the problem?)" value={form.notes} onChange={handleChange} />
          <div className="form-actions">
            <button type="submit">Book</button>
          </div>
        </form>
      )}
      {error && <p className="error">{error}</p>}

      {appointments.length > 0 && (
        <div className="table-wrap">
          <table className="section-table">
            <thead><tr><th>Date</th><th>Car</th><th>Service</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{showDateTime(a.preferred_datetime)}</td>
                  <td>{a.brand} {a.model}</td>
                  <td>{a.service_requested}<div className="muted">{a.notes}</div></td>
                  <td><span className={'badge ' + a.status}>{a.status}</span></td>
                  <td className="actions">
                    {a.status === 'rescheduled' && (
                      <>
                        <span>New date: <b>{showDateTime(a.proposed_datetime)}</b></span>
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
      )}
    </section>
  );
}
