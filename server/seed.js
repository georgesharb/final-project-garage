// npm run seed  -> a little demo data (only if the database has no clients yet).
// No owner here: the owner signs up himself in the app (only once).
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { query } from './query.js';

async function seed() {
  const clients = await query('SELECT id FROM clients');
  if (clients.length > 0) {
    console.log('Clients already exist, nothing to do');
    process.exit(0);
  }

  // One demo client (with his login) + a car and a repair, so the app isn't empty
  const hash = await bcrypt.hash('client123', 10);
  const [user] = await query(
    `INSERT INTO users (email, password_hash, role) OUTPUT INSERTED.id
     VALUES ('client@garage.com', @hash, 'client')`,
    { hash }
  );
  const [client] = await query(
    `INSERT INTO clients (user_id, name, phone) OUTPUT INSERTED.id
     VALUES (@userId, 'Rami Haddad', '03123456')`,
    { userId: user.id }
  );
  const [car] = await query(
    `INSERT INTO cars (client_id, brand, model, year, vin, plate_number) OUTPUT INSERTED.id
     VALUES (@clientId, 'Toyota', 'Corolla', 2018, 'JT2BF22K1W0123456', 'B 123456')`,
    { clientId: client.id }
  );
  await query(
    `INSERT INTO repairs (car_id, client_id, [date], description, cost, status)
     VALUES (@carId, @clientId, CAST(GETDATE() AS DATE), 'Oil change + filters', 60, 'done')`,
    { carId: car.id, clientId: client.id }
  );

  console.log('Demo client created: client@garage.com / client123 (+ a car and a repair)');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
