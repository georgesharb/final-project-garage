// Creates THE owner account, once.
// Usage (in the server folder):  npm run create-owner -- owner@gmail.com MyPassword123
// Sign up in the website is for clients only, so this is the only way to create the owner.
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { query } from './query.js';
import { checkEmailPassword } from './validate.js';

const [email, password] = process.argv.slice(2); // the 2 words after "--"

async function createOwner() {
  const problem = checkEmailPassword({ email, password });
  if (problem) {
    console.log(problem);
    console.log('Usage: npm run create-owner -- owner@gmail.com MyPassword123');
    process.exit(1);
  }

  // Only one owner (the database also blocks a 2nd one)
  const owners = await query("SELECT id FROM users WHERE role = 'owner'");
  if (owners.length > 0) {
    console.log('The owner account already exists.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10); // never store the real password
  await query(
    "INSERT INTO users (email, password_hash, role) VALUES (@email, @hash, 'owner')",
    { email, hash }
  );
  console.log('Owner created: ' + email + ' (log in with the "Owner" choice)');
  process.exit(0);
}

createOwner().catch((err) => {
  console.error('Could not create the owner:', err.message);
  process.exit(1);
});
