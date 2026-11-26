// Starts the server. The app itself (routes, security) is in app.js.
import app from './app.js';
import { getPool } from './db.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Connect to the database right away, so the first request is fast.
// If it fails, the server keeps running and tries again on the next request.
getPool().catch(() => console.log('Will retry the database on the next request'));
