// starts the Express server and imports poolPromise from db.js to ensure the database is connected before accepting requests.
// While db.js prepares the DB connection, server.js uses it
import express from 'express';
import { poolPromise } from './db.js';

const app = express();

app.get('/', (req, res) => {
    res.send('Garage Management API is running!');
});

// Start the server after connecting to the database
async function startServer() {
    try {
        await poolPromise; //It ensures that SQL Server is connected before Express starts accepting requests.

        app.listen(3000, () => {
            console.log('Server running on port 3000');
        });

    } catch (error) {
        console.error('Could not start the server:', error);
    }
}

startServer();