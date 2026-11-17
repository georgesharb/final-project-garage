// /api/auth  -> sign up, login (public routes, no token needed)
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../query.js';
import { checkEmailPassword, isEmpty } from '../validate.js';

const router = express.Router();

// Creates the JWT. clientId is null for the owner.
function makeToken(user, clientId) {
  return jwt.sign(
    { id: user.id, role: user.role, clientId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// GET /api/auth/owner-exists -> frontend uses this to enable/disable "Owner" on Sign up
router.get('/owner-exists', async (req, res) => {
  const rows = await query("SELECT id FROM users WHERE role = 'owner'");
  res.json({ exists: rows.length > 0 });
});

// POST /api/auth/register-owner  { email, password }
// Works only ONCE: after the first owner exists, it is refused
// (the database also blocks a 2nd owner with the UX_users_single_owner index).
router.post('/register-owner', async (req, res) => {
  const { email, password } = req.body;
  const problem = checkEmailPassword(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const owners = await query("SELECT id FROM users WHERE role = 'owner'");
  if (owners.length > 0) {
    return res.status(403).json({ error: 'Owner registration is closed' });
  }

  const hash = await bcrypt.hash(password, 10);
  await query(
    "INSERT INTO users (email, password_hash, role) VALUES (@email, @hash, 'owner')",
    { email, hash }
  );
  res.status(201).json({ message: 'Owner account created' });
});

// POST /api/auth/register  { name, phone, email, password }  -> a client signs up
// (the only way to become a client: the owner never creates clients)
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  const problem =
    (isEmpty(name) || isEmpty(phone) ? 'Name and phone are required' : null) ||
    checkEmailPassword(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const hash = await bcrypt.hash(password, 10);

  // One transaction: create the user AND its client row, or nothing at all
  await query(
    `SET XACT_ABORT ON;
     BEGIN TRANSACTION;
       INSERT INTO users (email, password_hash, role) VALUES (@email, @hash, 'client');
       INSERT INTO clients (user_id, name, phone) VALUES (SCOPE_IDENTITY(), @name, @phone);
     COMMIT;`,
    { email, hash, name, phone }
  );
  res.status(201).json({ message: 'Account created, you can log in' });
});

// POST /api/auth/login  { email, password, role }  -> { token, user }
// role = 'client' or 'owner', chosen on the login page
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  const users = await query('SELECT * FROM users WHERE email = @email', { email });
  const user = users[0];

  // Same message for wrong email, password or role (don't tell attackers which one)
  if (!user || user.role !== role || !(await bcrypt.compare(password || '', user.password_hash))) {
    return res.status(401).json({ error: 'Wrong email, password or role' });
  }

  // For a client, find his clients.id so every client route can use it
  let clientId = null;
  if (user.role === 'client') {
    const clients = await query(
      'SELECT id FROM clients WHERE user_id = @id AND deleted_at IS NULL',
      { id: user.id }
    );
    if (clients.length === 0) return res.status(403).json({ error: 'This account is disabled' });
    clientId = clients[0].id;
  }

  res.json({
    token: makeToken(user, clientId),
    user: { id: user.id, email: user.email, role: user.role }
  });
});

// POST /api/auth/logout -> with JWT, logout = the frontend deletes the token
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;
