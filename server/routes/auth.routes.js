import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { ROLES, signToken, requireAuth, publicUser } from '../auth.js';

const router = Router();

// POST /api/auth/login — SUPER_ADMIN and ADMIN only
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated. Contact the Super Admin.' });
    }
    if (!ROLES.includes(user.role)) {
      return res.status(403).json({ error: 'Access restricted to department administrators.' });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register/student — disabled
router.post('/register/student', (_req, res) => {
  res.status(403).json({ error: 'Public registration is disabled.' });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// GET /api/auth/invitations/:token — preview an invitation (public)
router.get('/invitations/:token', async (req, res, next) => {
  try {
    const invite = await prisma.invitation.findUnique({ where: { token: req.params.token } });
    if (!invite) return res.status(404).json({ error: 'Invitation not found' });
    if (invite.acceptedAt) return res.status(410).json({ error: 'Invitation already accepted' });
    if (invite.expiresAt < new Date()) return res.status(410).json({ error: 'Invitation expired' });
    if (!ROLES.includes(invite.role)) {
      return res.status(403).json({ error: 'Invitation role is no longer supported' });
    }

    res.json({
      invitation: {
        email: invite.email,
        name: invite.name,
        role: invite.role,
        expiresAt: invite.expiresAt,
        accepted: false,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/invitations/:token/accept { password }
router.post('/invitations/:token/accept', async (req, res, next) => {
  try {
    const { password } = req.body || {};
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const invite = await prisma.invitation.findUnique({ where: { token: req.params.token } });
    if (!invite) return res.status(404).json({ error: 'Invitation not found' });
    if (invite.acceptedAt) return res.status(410).json({ error: 'Invitation already accepted' });
    if (invite.expiresAt < new Date()) return res.status(410).json({ error: 'Invitation expired' });
    if (!ROLES.includes(invite.role)) {
      return res.status(403).json({ error: 'Invitation role is no longer supported' });
    }

    const existing = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invite.email,
          name: invite.name,
          passwordHash,
          role: invite.role,
        },
      });
      await tx.invitation.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
      return user;
    });

    res.status(201).json({ message: 'Admin account created. You can now log in.', user: publicUser(result) });
  } catch (err) {
    next(err);
  }
});

export default router;