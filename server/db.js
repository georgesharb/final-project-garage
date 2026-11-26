// Connection to SQL Server. Other files get it with getPool() (through query.js).
//
// Two ways to log in, chosen by what is in .env:
//  - On our laptops: Windows Authentication (no DB_USER in .env).
//    Uses the "msnodesqlv8" driver, which needs ODBC Driver 18 for SQL Server (Windows only).
//  - Online (Azure SQL): a SQL login (DB_USER and DB_PASSWORD in .env).
//    Uses the normal "mssql" driver, plain JavaScript, works on any computer.
import 'dotenv/config';
import sql from 'mssql';

let poolPromise = null; // the connection, created the first time it is needed

async function connect() {
  // Online: username + password
  if (process.env.DB_USER) {
    return new sql.ConnectionPool({
      server: process.env.DB_SERVER,
      port: Number(process.env.DB_PORT) || 1433,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: true,                                          // Azure requires an encrypted connection
        trustServerCertificate: process.env.DB_SERVER === 'localhost'
      }
    }).connect();
  }

  // Laptop: Windows account. The Windows driver is only loaded here,
  // so the online server (Linux) never needs it.
  let sqlWindows;
  try {
    sqlWindows = (await import('mssql/msnodesqlv8.js')).default;
  } catch {
    const error = new Error('Windows login needs the msnodesqlv8 driver (Windows only). Online, put DB_USER and DB_PASSWORD in the settings.');
    error.name = 'ConnectionError'; // the API answers 503 "Database unavailable"
    throw error;
  }
  return new sqlWindows.ConnectionPool({
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    driver: 'ODBC Driver 18 for SQL Server',
    options: {
      trustedConnection: true,      // use the current Windows account
      trustServerCertificate: true  // trust the local SQL Server certificate
    }
  }).connect();
}

// Returns the connection. If the database was down, the next call tries again.
export function getPool() {
  if (!poolPromise) {
    poolPromise = connect()
      .then((pool) => {
        console.log('Connected to SQL Server!');
        return pool;
      })
      .catch((error) => {
        poolPromise = null; // allow a new try on the next request
        console.error('Database connection failed:', error.message);
        throw error;
      });
  }
  return poolPromise;
}
