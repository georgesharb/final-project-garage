// Builds the Express app: security, routes and error handling.
// server.js starts it; the tests import it directly (without a real database).
import 'dotenv/config'; // loads .env into process.env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import vinRoutes from './routes/vin.js';
import clientRoutes from './routes/client.js';
import ownerDashboardRoutes from './routes/owner/dashboard.js';
import ownerClientsRoutes from './routes/owner/clients.js';
import ownerCarsRoutes from './routes/owner/cars.js';
import ownerRepairsRoutes from './routes/owner/repairs.js';
import ownerAppointmentsRoutes from './routes/owner/appointments.js';
import ownerBinRoutes from './routes/owner/bin.js';

const app = express();

// Online, the host (Render) sits in front of us: trust it so the rate limit sees the real IP
app.set('trust proxy', 1);

// Security headers (helmet). Images can still be used by our React site.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Which websites may call the API. FRONTEND_URL can hold several, separated by commas
// (example: http://localhost:5173,https://our-site.vercel.app)
const allowedSites = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((site) => site.trim());
app.use(cors({ origin: allowedSites }));

app.use(express.json({ limit: '100kb' })); // read JSON bodies (small ones only)

// Limit the number of tries, to slow down password guessing and spam accounts
const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    message: { error: 'Too many login attempts, try again in 15 minutes' }
});
const registerLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10,
    message: { error: 'Too many accounts created, try again later' }
});

app.get('/', (req, res) => {
    res.send('Garage Management API is running!');
});

// ---------- Public ----------
app.use('/api/auth/login', loginLimit);
app.use('/api/auth/register', registerLimit);
app.use('/api/auth', authRoutes);

// ---------- Any logged-in user (owner or client) ----------
app.use('/api/vin', requireAuth, vinRoutes);

// ---------- Client only ----------
app.use('/api/me', requireAuth, requireRole('client'), clientRoutes);

// ---------- Owner only ----------
const ownerOnly = [requireAuth, requireRole('owner')];
app.use('/api/owner/dashboard', ownerOnly, ownerDashboardRoutes);
app.use('/api/owner/clients', ownerOnly, ownerClientsRoutes);
app.use('/api/owner/cars', ownerOnly, ownerCarsRoutes);
app.use('/api/owner/repairs', ownerOnly, ownerRepairsRoutes);
app.use('/api/owner/appointments', ownerOnly, ownerAppointmentsRoutes);
app.use('/api/owner/bin', ownerOnly, ownerBinRoutes);

// ---------- Unknown route ----------
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ---------- Errors ----------
// Express 5 sends every error thrown in an async route here.
app.use((err, req, res, next) => {
    console.error(req.method, req.originalUrl, '->', err.number || err.code || err.message);

    // The body is not valid JSON
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    // The database cannot be reached (stopped, asleep, wrong .env...)
    if (err.name === 'ConnectionError' || ['ESOCKET', 'ELOGIN', 'ETIMEOUT', 'EINSTLOOKUP'].includes(err.code)) {
        return res.status(503).json({ error: 'Database unavailable, try again in a minute' });
    }
    // SQL Server error numbers
    if (err.number === 2627 || err.number === 2601) {
        return res.status(409).json({ error: 'Already exists: email or VIN is taken (check the bin too)' });
    }
    if (err.number === 547) {
        return res.status(409).json({ error: 'Invalid link, or it is still used elsewhere' });
    }
    if (err.number === 515) {
        return res.status(400).json({ error: 'A required field is missing' });
    }
    if (err.number === 245 || err.number === 241 || err.number === 8114) {
        return res.status(400).json({ error: 'Invalid value (check ids, numbers and dates)' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
});

export default app;
