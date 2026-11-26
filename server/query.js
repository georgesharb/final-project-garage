// One helper to run SQL queries safely, using the connection from db.js.
import { getPool } from './db.js';

// Usage: await query('SELECT * FROM cars WHERE id = @id', { id: 5 })
// Values are sent as parameters (@name), never glued into the SQL string,
// so this protects us from SQL injection.
export async function query(text, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  for (const name in params) {
    request.input(name, params[name] ?? null); // missing value -> NULL
  }
  const result = await request.query(text);
  return result.recordset || []; // the rows (an array)
}
