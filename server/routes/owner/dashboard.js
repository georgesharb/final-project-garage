// /api/owner/dashboard  -> numbers for the owner's home page
import express from 'express';
import { query } from '../../query.js';

const router = express.Router();

// GET /api/owner/dashboard
router.get('/', async (req, res) => {
  const rows = await query(`
    SELECT
      (SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL) AS total_clients,
      (SELECT COUNT(*) FROM cars    WHERE deleted_at IS NULL) AS total_cars,
      (SELECT COUNT(*) FROM repairs WHERE deleted_at IS NULL AND status = 'in progress') AS cars_in_garage,
      (SELECT COUNT(*) FROM appointments WHERE status = 'pending') AS pending_appointments,
      (SELECT ISNULL(SUM(cost), 0) FROM repairs
        WHERE deleted_at IS NULL AND status = 'done'
          AND MONTH([date]) = MONTH(GETDATE())
          AND YEAR([date])  = YEAR(GETDATE())) AS income_this_month
  `);
  res.json(rows[0]);
});

export default router;
