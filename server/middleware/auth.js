import jwt from 'jsonwebtoken';

// 1) Checks the token. If valid, puts the user in req.user
export function requireAuth(req, res, next) {
  const header = req.headers.authorization; // "Bearer <token>"
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please log in' });
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, clientId }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// 2) Checks the role. Use it after requireAuth: requireRole('owner')
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}
