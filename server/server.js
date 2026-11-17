// starts the Express server and imports poolPromise from db.js to ensure the database is connected before accepting requests.
// While db.js prepares the DB connection, server.js uses it
import 'dotenv/config'; // loads .env into process.env
import express from 'express';
import cors from 'cors';
import { poolPromise } from './db.js';
import { requireAuth, requireRole } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import servicesRoutes from './routes/services.js';
import clientRoutes from './routes/client.js';
import ownerDashboardRoutes from './routes/owner/dashboard.js';
import ownerClientsRoutes from './routes/owner/clients.js';
import ownerCarsRoutes from './routes/owner/cars.js';
import ownerRepairsRoutes from './routes/owner/repairs.js';
import ownerAppointmentsRoutes from './routes/owner/appointments.js';
import ownerBinRoutes from './routes/owner/bin.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL })); // allow our React app
app.use(express.json());                              // read JSON bodies

app.get('/', (req, res) => {
    res.send('Garage Management API is running!');
});

// ---------- Public ----------
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);

// ---------- Client only ----------
app.use('/api/me', requireAuth, requireRole('client'), clientRoutes);

// ---------- Owner only ----------
const ownerOnly = [requireAuth, requireRole('owner')];
app.use('/api/owner/dashboard',    ownerOnly, ownerDashboardRoutes);
app.use('/api/owner/clients',      ownerOnly, ownerClientsRoutes);
app.use('/api/owner/cars',         ownerOnly, ownerCarsRoutes);
app.use('/api/owner/repairs',      ownerOnly, ownerRepairsRoutes);
app.use('/api/owner/appointments', ownerOnly, ownerAppointmentsRoutes);
app.use('/api/owner/bin',          ownerOnly, ownerBinRoutes);

// ---------- Unknown route ----------
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ---------- Errors ----------
// Express 5 sends every error thrown in an async route here.
app.use((err, req, res, next) => {
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

const PORT = process.env.PORT || 3000;

// Start the server after connecting to the database
async function startServer() {
    try {
        await poolPromise; //It ensures that SQL Server is connected before Express starts accepting requests.

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Could not start the server:', error);
    }
}

startServer();
