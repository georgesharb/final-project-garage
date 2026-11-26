// /api/auth  -> client sign up, login (public routes, no token needed)
// The owner account is NOT created here: run `npm run create-owner` once (see create-owner.js).
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../query.js';
import { checkEmailPassword, checkLogin, checkPhone, isEmpty } from '../validate.js';

const router = express.Router();

// Creates the JWT. clientId is null for the owner.
function makeToken(user, clientId) {
  return jwt.sign(
    { id: user.id, role: user.role, clientId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// POST /api/auth/register  { name, phone, email, password }  -> a client signs up
// (the only way to become a client: the owner never creates clients)
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  const problem =
    (isEmpty(name) || isEmpty(phone) ? 'Name and phone are required' : null) ||
    checkPhone(phone) ||
    checkEmailPassword(req.body);
  if (problem) return res.status(400).json({ error: problem });

  // Clear message if the email is already used (instead of a SQL error)
  const existing = await query('SELECT id FROM users WHERE email = @email', { email });
  if (existing.length > 0) {
    return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
  }

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
  res.status(201).json({ message: 'Your account is ready. You can log in now.' });
});

// POST /api/auth/login  { email, password, role }  -> { token, user }
// role = 'client' or 'owner', chosen on the login page
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const problem = checkLogin(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const users = await query('SELECT * FROM users WHERE email = @email', { email });
  const user = users[0];

  // Same message for wrong email, password or role (don't tell attackers which one)
  if (!user || user.role !== role || !(await bcrypt.compare(password || '', user.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password. Check that you chose the right account type (Client or Owner).' });
  }

  // For a client, find his clients.id so every client route can use it
  let clientId = null;
  if (user.role === 'client') {
    const clients = await query(
      'SELECT id FROM clients WHERE user_id = @id AND deleted_at IS NULL',
      { id: user.id }
    );
    if (clients.length === 0) return res.status(403).json({ error: 'This account was removed by the garage. Please contact us.' });
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
