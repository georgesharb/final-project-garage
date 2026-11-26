// /api/owner/clients  -> owner sees, edits and deletes clients.
// The owner does NOT add clients: clients sign up themselves.
// Delete = move to the bin (deleted_at = now). Every list shows only "deleted_at IS NULL".
import express from 'express';
import { query } from '../../query.js';
import { checkClient } from '../../validate.js';

const router = express.Router();

// GET /api/owner/clients?name=ali  -> active clients (with their login email), search by name
router.get('/', async (req, res) => {
  const name = '%' + (req.query.name || '') + '%';
  const rows = await query(
    `SELECT c.*, u.email
     FROM clients c
     JOIN users u ON u.id = c.user_id
     WHERE c.deleted_at IS NULL AND c.name LIKE @name
     ORDER BY c.name`,
    { name }
  );
  res.json(rows);
});

// GET /api/owner/clients/:id  -> client + cars + repair history + total spent
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  const clients = await query(
    `SELECT c.*, u.email
     FROM clients c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = @id AND c.deleted_at IS NULL`,
    { id }
  );
  if (clients.length === 0) return res.status(404).json({ error: 'Client not found' });

  const cars = await query('SELECT * FROM cars WHERE client_id = @id AND deleted_at IS NULL', { id });

  // Repairs PAID by this client (repairs.client_id), so it stays right if a car was sold
  const repairs = await query(
    `SELECT r.*, c.brand, c.model, c.plate_number, c.vin
     FROM repairs r
     JOIN cars c ON c.id = r.car_id
     WHERE r.client_id = @id AND r.deleted_at IS NULL
     ORDER BY r.[date] DESC`,
    { id }
  );

  // Total spent = repairs that are done (same rule as the income on the dashboard)
  const total = repairs
    .filter((r) => r.status === 'done')
    .reduce((sum, r) => sum + Number(r.cost), 0);

  res.json({ client: clients[0], cars, repairs, total_spent: total });
});

// PUT /api/owner/clients/:id  { name, phone, email }  (only the owner can change a client's info)
router.put('/:id', async (req, res) => {
  const { name, phone, email } = req.body;
  const problem = checkClient(req.body);
  if (problem) return res.status(400).json({ error: problem });

  // Name and phone are in "clients", the email (= his login) is in "users"
  const rows = await query(
    `SET XACT_ABORT ON;
     BEGIN TRANSACTION;
       UPDATE users SET email = @email
       WHERE id = (SELECT user_id FROM clients WHERE id = @id AND deleted_at IS NULL);
       UPDATE clients SET name = @name, phone = @phone
       OUTPUT INSERTED.*
       WHERE id = @id AND deleted_at IS NULL;
     COMMIT;`,
    { id: req.params.id, name, phone, email }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
  res.json({ ...rows[0], email });
});

// DELETE /api/owner/clients/:id  -> move to the bin
router.delete('/:id', async (req, res) => {
  const cars = await query(
    'SELECT id FROM cars WHERE client_id = @id AND deleted_at IS NULL',
    { id: req.params.id }
  );
  if (cars.length > 0) {
    return res.status(409).json({ error: 'This client still has cars. Delete his cars first.' });
  }

  const rows = await query(
    `UPDATE clients SET deleted_at = GETDATE()
     OUTPUT INSERTED.id
     WHERE id = @id AND deleted_at IS NULL`,
    { id: req.params.id }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
  res.json({ message: 'Client moved to the bin' });
});

export default router;
