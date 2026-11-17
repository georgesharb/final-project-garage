// /api/owner/bin  -> see deleted clients, cars and repairs, and restore them
import express from 'express';
import { query } from '../../query.js';

const router = express.Router();

// GET /api/owner/bin
router.get('/', async (req, res) => {
  const clients = await query(
    `SELECT c.*, u.email
     FROM clients c JOIN users u ON u.id = c.user_id
     WHERE c.deleted_at IS NOT NULL
     ORDER BY c.deleted_at DESC`
  );

  const cars = await query(
    `SELECT c.*, cl.name AS client_name
     FROM cars c JOIN clients cl ON cl.id = c.client_id
     WHERE c.deleted_at IS NOT NULL
     ORDER BY c.deleted_at DESC`
  );

  const repairs = await query(
    `SELECT r.*, c.brand, c.model, c.vin, cl.name AS client_name
     FROM repairs r
     JOIN cars c     ON c.id = r.car_id
     JOIN clients cl ON cl.id = r.client_id
     WHERE r.deleted_at IS NOT NULL
     ORDER BY r.deleted_at DESC`
  );

  res.json({ clients, cars, repairs });
});

// PATCH /api/owner/bin/clients/:id/restore
router.patch('/clients/:id/restore', async (req, res) => {
  await query('UPDATE clients SET deleted_at = NULL WHERE id = @id', { id: req.params.id });
  res.json({ message: 'Client restored' });
});

// PATCH /api/owner/bin/cars/:id/restore  (its client must be active)
router.patch('/cars/:id/restore', async (req, res) => {
  const rows = await query(
    `SELECT cl.deleted_at FROM cars c JOIN clients cl ON cl.id = c.client_id WHERE c.id = @id`,
    { id: req.params.id }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Car not found' });
  if (rows[0].deleted_at) return res.status(409).json({ error: 'Restore the client first' });

  await query('UPDATE cars SET deleted_at = NULL WHERE id = @id', { id: req.params.id });
  res.json({ message: 'Car restored' });
});

// PATCH /api/owner/bin/repairs/:id/restore  (its car must be active)
router.patch('/repairs/:id/restore', async (req, res) => {
  const rows = await query(
    `SELECT c.deleted_at FROM repairs r JOIN cars c ON c.id = r.car_id WHERE r.id = @id`,
    { id: req.params.id }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Repair not found' });
  if (rows[0].deleted_at) return res.status(409).json({ error: 'Restore the car first' });

  await query('UPDATE repairs SET deleted_at = NULL WHERE id = @id', { id: req.params.id });
  res.json({ message: 'Repair restored' });
});

export default router;
