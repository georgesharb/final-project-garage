// /api/owner/cars  -> owner manages all cars (CRUD + search by VIN/plate)
// Delete = move to the bin. Every list shows only "deleted_at IS NULL".
import express from 'express';
import { query } from '../../query.js';
import { checkCar } from '../../validate.js';

const router = express.Router();

// GET /api/owner/cars  -> all active cars with their owner's name
router.get('/', async (req, res) => {
  const rows = await query(
    `SELECT c.*, cl.name AS client_name
     FROM cars c
     JOIN clients cl ON cl.id = c.client_id
     WHERE c.deleted_at IS NULL
     ORDER BY c.id DESC`
  );
  res.json(rows);
});

// GET /api/owner/cars/search?q=ABC123  -> car + its owner + all its repairs
// (must stay ABOVE "/:id", otherwise "search" is read as an id)
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Type a plate or VIN' });

  const cars = await query(
    `SELECT c.*, cl.name AS client_name, cl.phone AS client_phone
     FROM cars c
     JOIN clients cl ON cl.id = c.client_id
     WHERE c.deleted_at IS NULL AND (c.plate_number = @q OR c.vin = @q)`,
    { q }
  );
  if (cars.length === 0) return res.status(404).json({ error: 'No car found' });

  const car = cars[0];
  const repairs = await query(
    'SELECT * FROM repairs WHERE car_id = @id AND deleted_at IS NULL ORDER BY [date] DESC',
    { id: car.id }
  );

  res.json({ car, repairs }); // repairs can be [] -> the car still shows
});

// GET /api/owner/cars/:id
router.get('/:id', async (req, res) => {
  const rows = await query('SELECT * FROM cars WHERE id = @id AND deleted_at IS NULL', { id: req.params.id });
  if (rows.length === 0) return res.status(404).json({ error: 'Car not found' });
  res.json(rows[0]);
});

// POST /api/owner/cars  { client_id, brand, model, year, vin, plate_number (optional) }
router.post('/', async (req, res) => {
  const { client_id, brand, model, year, vin, plate_number } = req.body;
  const problem = (!client_id ? 'Client is required' : null) || checkCar(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const rows = await query(
    `INSERT INTO cars (client_id, brand, model, year, vin, plate_number)
     OUTPUT INSERTED.*
     VALUES (@client_id, @brand, @model, @year, @vin, @plate_number)`,
    { client_id, brand, model, year, vin, plate_number: plate_number || null }
  );
  res.status(201).json(rows[0]);
});

// PUT /api/owner/cars/:id  -> also used when a car is sold (change client_id)
router.put('/:id', async (req, res) => {
  const { client_id, brand, model, year, vin, plate_number } = req.body;
  const problem = (!client_id ? 'Client is required' : null) || checkCar(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const rows = await query(
    `UPDATE cars
     SET client_id = @client_id, brand = @brand, model = @model, year = @year,
         vin = @vin, plate_number = @plate_number
     OUTPUT INSERTED.*
     WHERE id = @id AND deleted_at IS NULL`,
    { id: req.params.id, client_id, brand, model, year, vin, plate_number: plate_number || null }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Car not found' });
  res.json(rows[0]);
});

// DELETE /api/owner/cars/:id  -> move to the bin
router.delete('/:id', async (req, res) => {
  const repairs = await query(
    'SELECT id FROM repairs WHERE car_id = @id AND deleted_at IS NULL',
    { id: req.params.id }
  );
  if (repairs.length > 0) {
    return res.status(409).json({ error: 'This car still has repairs. Delete its repairs first.' });
  }

  const rows = await query(
    `UPDATE cars SET deleted_at = GETDATE()
     OUTPUT INSERTED.id
     WHERE id = @id AND deleted_at IS NULL`,
    { id: req.params.id }
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Car not found' });
  res.json({ message: 'Car moved to the bin' });
});

export default router;
