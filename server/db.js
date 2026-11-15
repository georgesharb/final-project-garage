//This file creates and manages the connection to SQL Server. It exports poolPromise so other files can use that connection.
// It prepares the database connection

// Import SQL Server with Windows Authentication support
import sql from 'mssql/msnodesqlv8.js';

// Load environment variables from the .env file
import 'dotenv/config';


// Database connection settings
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,

    // Specify the installed SQL Server ODBC driver
    driver: 'ODBC Driver 18 for SQL Server',

    options: {
        trustedConnection: true,       // Use the current Windows account
        trustServerCertificate: true  // Trust the local SQL Server certificate
    }
};

// Create a connection pool to manage database connections
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        // Display a message when the connection succeeds
        console.log('Connected to SQL Server!');
        return pool;
    })
    .catch(error => {
        // Display the error if the connection fails
        console.error('Database connection failed:', error);
        throw error;
    });

// Export SQL Server tools and the connection pool for other files
export { sql, poolPromise };
