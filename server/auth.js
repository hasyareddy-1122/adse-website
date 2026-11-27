import jwt from 'jsonwebtoken';
import prisma from './db.js';

export const ROLES = ['SUPER_ADMIN', 'ADMIN'];
export const ROLE_RANK = { ADMIN: 1, SUPER_ADMIN: 2 };

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Verifies the Bearer JWT and loads the current user from the DB so that
// deactivated accounts / changed roles take effect immediately.
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      req.user = null;
      return next();
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || !ROLES.includes(user.role)) {
      return res.status(401).json({ error: 'Account is inactive or unauthorized' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  next();
}

// Exact-role gate: requireRole('ADMIN', 'SUPER_ADMIN')
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Login required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden — requires role: ${roles.join(' or ')}` });
    }
    next();
  };
}

// Hierarchy gate: requireMinRole('ADMIN') lets ADMIN and SUPER_ADMIN pass.
export function requireMinRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Login required' });
    if ((ROLE_RANK[req.user.role] ?? 0) < (ROLE_RANK[role] ?? 99)) {
      return res.status(403).json({ error: `Forbidden — requires ${role} or above` });
    }
    next();
  };
}

export const publicUser = (u) =>
  u && {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
  };