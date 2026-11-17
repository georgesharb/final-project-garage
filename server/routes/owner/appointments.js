// /api/owner/appointments  -> owner accepts, rejects or proposes another date
import express from 'express';
import { query } from '../../query.js';
import { checkFutureDate } from '../../validate.js';

const router = express.Router();

// GET /api/owner/appointments?status=pending
router.get('/', async (req, res) => {
  const status = req.query.status || null;
  const rows = await query(
    `SELECT a.*, cl.name AS client_name, cl.phone AS client_phone,
            c.brand, c.model, c.plate_number
     FROM appointments a
     JOIN clients cl ON cl.id = a.client_id
     JOIN cars c     ON c.id = a.car_id
     WHERE @status IS NULL OR a.status = @status
     ORDER BY a.preferred_datetime`,
    { status }
  );
  res.json(rows);
});

// Small helper: change the status of one appointment
async function setStatus(id, status, proposed_datetime = null) {
  const rows = await query(
    `UPDATE appointments
     SET status = @status, proposed_datetime = @proposed_datetime
     OUTPUT INSERTED.*
     WHERE id = @id`,
    { id, status, proposed_datetime }
  );
  return rows[0]; // undefined if not found
}

// PATCH /api/owner/appointments/:id/accept
router.patch('/:id/accept', async (req, res) => {
  const appointment = await setStatus(req.params.id, 'accepted');
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
  res.json(appointment);
});

// PATCH /api/owner/appointments/:id/reject
router.patch('/:id/reject', async (req, res) => {
  const appointment = await setStatus(req.params.id, 'rejected');
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
  res.json(appointment);
});

// PATCH /api/owner/appointments/:id/propose  { proposed_datetime }
// Status becomes 'rescheduled'. The client then accepts or declines from his side.
router.patch('/:id/propose', async (req, res) => {
  const { proposed_datetime } = req.body;
  const problem = checkFutureDate(proposed_datetime);
  if (problem) return res.status(400).json({ error: problem });

  const appointment = await setStatus(req.params.id, 'rescheduled', proposed_datetime);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
  res.json(appointment);
});

export default router;
