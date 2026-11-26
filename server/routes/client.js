// /api/me  -> everything a logged-in CLIENT can do.
// SECURITY RULE: the client id ALWAYS comes from the token (req.user.clientId),
// never from the URL or the body. Every query has "WHERE client_id = @clientId",
// so a client can only see his own data.
// Clients can NOT edit their info or cars (only the owner can).
import express from 'express';
import { query } from '../query.js';
import { checkCar, checkFutureDate, isEmpty } from '../validate.js';
import { toSqlDateTime } from '../dates.js';

const router = express.Router();

/* ---------- My info (read only) ---------- */

// GET /api/me  -> name, phone + email (the email is stored in users)
router.get('/', async (req, res) => {
  const rows = await query(
    `SELECT c.id, c.name, c.phone, u.email
     FROM clients c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = @clientId`,
    { clientId: req.user.clientId }
  );
  res.json(rows[0]);
});

/* ---------- My cars (view + add only) ---------- */

// GET /api/me/cars
router.get('/cars', async (req, res) => {
  const rows = await query(
    'SELECT * FROM cars WHERE client_id = @clientId AND deleted_at IS NULL ORDER BY id DESC',
    { clientId: req.user.clientId }
  );
  res.json(rows);
});

// POST /api/me/cars  { brand, model, year, vin, plate_number (optional) }
router.post('/cars', async (req, res) => {
  const { brand, model, year, vin, plate_number } = req.body;
  const problem = checkCar(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const rows = await query(
    `INSERT INTO cars (client_id, brand, model, year, vin, plate_number)
     OUTPUT INSERTED.*
     VALUES (@clientId, @brand, @model, @year, @vin, @plate_number)`,
    { clientId: req.user.clientId, brand, model, year, vin, plate_number: plate_number || null }
  );
  res.status(201).json(rows[0]);
});

/* ---------- My repairs (history) ---------- */

// GET /api/me/repairs
router.get('/repairs', async (req, res) => {
  const rows = await query(
    `SELECT r.*, c.brand, c.model, c.plate_number, c.vin
     FROM repairs r
     JOIN cars c ON c.id = r.car_id
     WHERE r.client_id = @clientId AND r.deleted_at IS NULL
     ORDER BY r.[date] DESC`,
    { clientId: req.user.clientId }
  );
  res.json(rows);
});

/* ---------- My appointments ---------- */

// GET /api/me/appointments
router.get('/appointments', async (req, res) => {
  const rows = await query(
    `SELECT a.*, c.brand, c.model, c.plate_number
     FROM appointments a
     JOIN cars c ON c.id = a.car_id
     WHERE a.client_id = @clientId
     ORDER BY a.preferred_datetime DESC`,
    { clientId: req.user.clientId }
  );
  res.json(rows);
});

// POST /api/me/appointments  { car_id, service_requested, preferred_datetime, notes }
router.post('/appointments', async (req, res) => {
  const { car_id, service_requested, preferred_datetime, notes } = req.body;
  const problem =
    (!car_id ? 'Choose a car' : null) ||
    (isEmpty(service_requested) ? 'Choose a service' : null) ||
    checkFutureDate(preferred_datetime);
  if (problem) return res.status(400).json({ error: problem });

  // The car must belong to THIS client
  const cars = await query(
    'SELECT id FROM cars WHERE id = @car_id AND client_id = @clientId AND deleted_at IS NULL',
    { car_id, clientId: req.user.clientId }
  );
  if (cars.length === 0) {
    return res.status(400).json({ error: 'Choose one of your registered cars' });
  }

  const rows = await query(
    `INSERT INTO appointments (client_id, car_id, service_requested, preferred_datetime, notes, status)
     OUTPUT INSERTED.*
     VALUES (@clientId, @car_id, @service_requested, @preferred_datetime, @notes, 'pending')`,
    { clientId: req.user.clientId, car_id, service_requested, preferred_datetime: toSqlDateTime(preferred_datetime), notes: notes || null }
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/me/appointments/:id/respond  { accept: true | false }
// Used when the owner proposed another date (status 'rescheduled')
// Accept -> 'accepted' and the new date becomes the appointment date. Decline -> 'rejected'.
router.patch('/appointments/:id/respond', async (req, res) => {
  const accept = req.body.accept === true;

  const rows = await query(
    `UPDATE appointments
     SET status = @newStatus,
         preferred_datetime = CASE WHEN @accept = 1 THEN proposed_datetime ELSE preferred_datetime END
     OUTPUT INSERTED.*
     WHERE id = @id AND client_id = @clientId AND status = 'rescheduled'`,
    {
      id: req.params.id,
      clientId: req.user.clientId,
      accept: accept ? 1 : 0,
      newStatus: accept ? 'accepted' : 'rejected'
    }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'No proposal to answer' });
  res.json(rows[0]);
});

export default router;
