import { useEffect, useState } from 'react';
import { api, showDateTime } from '../../api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [proposeId, setProposeId] = useState(null); // which row shows the date picker
  const [proposedDate, setProposedDate] = useState('');
  const [error, setError] = useState('');

  async function loadAppointments() {
    setAppointments(await api('/owner/appointments?status=' + statusFilter));
  }

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  // action = 'accept' | 'reject' | 'propose'
  async function changeStatus(id, action, body) {
    setError('');
    try {
      await api(`/owner/appointments/${id}/${action}`, 'PATCH', body);
      setProposeId(null);
      loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Appointments</h1>

      <select className="filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="proposed">Proposed</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr><th>Date</th><th>Client</th><th>Car</th><th>Note</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td>
                {showDateTime(a.appointment_date)}
                {a.proposed_date && <div className="muted">Proposed: {showDateTime(a.proposed_date)}</div>}
              </td>
              <td>{a.client_name}<div className="muted">{a.client_phone}</div></td>
              <td>{a.brand} {a.model} ({a.plate_number})</td>
              <td>{a.note}</td>
              <td><span className={'badge ' + a.status}>{a.status}</span></td>
              <td className="actions">
                {a.status === 'pending' && proposeId !== a.id && (
                  <>
                    <button onClick={() => changeStatus(a.id, 'accept')}>Accept</button>
                    <button className="btn-danger" onClick={() => changeStatus(a.id, 'reject')}>Reject</button>
                    <button className="btn-light" onClick={() => setProposeId(a.id)}>Propose date</button>
                  </>
                )}
                {proposeId === a.id && (
                  <>
                    <input type="datetime-local" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} />
                    <button onClick={() => changeStatus(a.id, 'propose', { proposed_date: proposedDate })}>Send</button>
                    <button className="btn-light" onClick={() => setProposeId(null)}>Cancel</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {appointments.length === 0 && <p className="muted">No appointments here.</p>}
    </div>
  );
}
