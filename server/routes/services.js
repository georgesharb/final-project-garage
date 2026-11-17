// /api/services  -> public list for the main page (no login, no database table)
import express from 'express';

const router = express.Router();

const services = [
  { id: 1, name: 'Oil change', description: 'Engine oil and filter replacement' },
  { id: 2, name: 'Brakes', description: 'Pads, discs and brake fluid' },
  { id: 3, name: 'Diagnostics', description: 'Computer check of engine and sensors' },
  { id: 4, name: 'Air conditioning', description: 'Gas refill and AC repair' },
  { id: 5, name: 'Tires', description: 'Change, balancing and alignment' },
  { id: 6, name: 'General repair', description: 'Engine, gearbox and suspension work' }
];

// GET /api/services
router.get('/', (req, res) => {
  res.json(services);
});

export default router;
