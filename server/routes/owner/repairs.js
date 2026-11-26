// /api/owner/repairs  -> owner records repairs (CRUD)
// Delete = move to the bin. Every list shows only "deleted_at IS NULL".
import express from 'express';
import { query } from '../../query.js';
import { checkRepair } from '../../validate.js';

const router = express.Router();

// GET /api/owner/repairs?status=done  -> all active repairs (optional filter by status)
router.get('/', async (req, res) => {
  const status = req.query.status || null;
  const rows = await query(
    `SELECT r.*, c.plate_number, c.vin, c.brand, c.model, cl.name AS client_name
     FROM repairs r
     JOIN cars c     ON c.id = r.car_id
     JOIN clients cl ON cl.id = r.client_id
     WHERE r.deleted_at IS NULL AND (@status IS NULL OR r.status = @status)
     ORDER BY r.[date] DESC, r.id DESC`,
    { status }
  );
  res.json(rows);
});

// GET /api/owner/repairs/:id
router.get('/:id', async (req, res) => {
  const rows = await query('SELECT * FROM repairs WHERE id = @id AND deleted_at IS NULL', { id: req.params.id });
  if (rows.length === 0) return res.status(404).json({ error: 'Repair not found' });
  res.json(rows[0]);
});

// POST /api/owner/repairs  -> add ONE OR MORE repairs for a car in one go
// { car_id, date, status, items: [ { description, cost }, { description, cost } ] }
// Each item becomes one row in "repairs", billed to the car's CURRENT owner.
router.post('/', async (req, res) => {
  const { car_id, date, status, items } = req.body;

  if (!car_id) return res.status(400).json({ error: 'Car is required' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Add at least one repair' });
  }

  // Check ALL items first, so we never save half of them
  for (const item of items) {
    const problem = checkRepair({ ...item, date, status });
    if (problem) return res.status(400).json({ error: problem });
  }

  const cars = await query('SELECT client_id FROM cars WHERE id = @car_id AND deleted_at IS NULL', { car_id });
  if (cars.length === 0) return res.status(404).json({ error: 'Car not found' });

  const saved = [];
  for (const item of items) {
    const rows = await query(
      `INSERT INTO repairs (car_id, client_id, description, cost, [date], status)
       OUTPUT INSERTED.*
       VALUES (@car_id, @client_id, @description, @cost, @date, @status)`,
      { car_id, client_id: cars[0].client_id, description: item.description, cost: item.cost, date, status }
    );
    saved.push(rows[0]);
  }
  res.status(201).json(saved);
});

// PUT /api/owner/repairs/:id  { description, cost, date, status }
router.put('/:id', async (req, res) => {
  const { description, cost, date, status } = req.body;
  const problem = checkRepair(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const rows = await query(
    `UPDATE repairs
     SET description = @description, cost = @cost, [date] = @date, status = @status
     OUTPUT INSERTED.*
     WHERE id = @id AND deleted_at IS NULL`,
    { id: req.params.id, description, cost, date, status }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Repair not found' });
  res.json(rows[0]);
});

// DELETE /api/owner/repairs/:id  -> move to the bin
router.delete('/:id', async (req, res) => {
  const rows = await query(
    `UPDATE repairs SET deleted_at = GETDATE()
     OUTPUT INSERTED.id
     WHERE id = @id AND deleted_at IS NULL`,
    { id: req.params.id }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Repair not found' });
  res.json({ message: 'Repair moved to the bin' });
});

export default router;
