import { useEffect, useState } from 'react';
import { api, showDateTime } from '../../api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [proposeId, setProposeId] = useState(null); // which row shows the date picker
  const [proposedDate, setProposedDate] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Load the appointments with the chosen status.
  // "refresh" changes after every add / edit / delete, so the list is loaded again.
  useEffect(() => {
    let ignore = false; // true if a newer request started (avoids showing an old answer)
    api('/owner/appointments?status=' + statusFilter)
      .then((data) => { if (!ignore) setAppointments(data); })
      .catch((err) => setError(err.message));
    return () => { ignore = true; };
  }, [statusFilter, refresh]);

  // Ask the effect above to load the list again
  function loadAppointments() {
    setRefresh((n) => n + 1);
  }

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

      <select aria-label="Filter by status" className="filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="rescheduled">Rescheduled</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>

      {error && <p className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Date</th><th>Client</th><th>Car</th><th>Service</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>
                  {showDateTime(a.preferred_datetime)}
                  {a.proposed_datetime && <div className="muted">Proposed: {showDateTime(a.proposed_datetime)}</div>}
                </td>
                <td>{a.client_name}<div className="muted">{a.client_phone}</div></td>
                <td>{a.brand} {a.model} ({a.plate_number})</td>
                <td>{a.service_requested}<div className="muted">{a.notes}</div></td>
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
                      <input aria-label="New date and time" type="datetime-local" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} />
                      <button onClick={() => changeStatus(a.id, 'propose', { proposed_datetime: proposedDate })}>Send</button>
                      <button className="btn-light" onClick={() => setProposeId(null)}>Cancel</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {appointments.length === 0 && <p className="muted">No appointments here.</p>}
    </div>
  );
}
