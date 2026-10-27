import { Router } from 'express';
import crypto from 'crypto';
import prisma from '../db.js';
import { requireMinRole, publicUser } from '../auth.js';
import { sendInviteEmail } from '../mailer.js';

// User administration — ADMIN (HOD) manages faculties & students;
// SUPER_ADMIN additionally manages admins.
const router = Router();
router.use(requireMinRole('ADMIN'));

const MANAGEABLE_BY_ADMIN = ['FACULTY', 'STUDENT'];

function canManage(actor, targetRole) {
  if (actor.role === 'SUPER_ADMIN') return true;
  return MANAGEABLE_BY_ADMIN.includes(targetRole);
}

// GET /api/users?role=FACULTY
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.user.role === 'ADMIN') where.role = { in: MANAGEABLE_BY_ADMIN };
    const users = await prisma.user.findMany({
      where,
      include: { facultyProfile: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
    res.json({ users: users.map((u) => ({ ...publicUser(u), facultyProfileId: u.facultyProfile?.id ?? null })) });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/invite — email-authenticated onboarding
router.post('/invite', async (req, res, next) => {
  try {
    const { email, name, role } = req.body || {};
    const normalized = String(email || '').toLowerCase().trim();
    if (!normalized || !name) return res.status(400).json({ error: 'name and email are required' });

    const inviteRole = String(role || 'FACULTY').toUpperCase();
    const allowedRoles = req.user.role === 'SUPER_ADMIN' ? ['ADMIN', 'FACULTY'] : ['FACULTY'];
    if (!allowedRoles.includes(inviteRole)) {
      return res.status(403).json({
        error:
          req.user.role === 'ADMIN'
            ? 'HODs can only invite FACULTY members'
            : 'Invalid role for invitation',
      });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

    // Revoke previous pending invites for the same email
    await prisma.invitation.deleteMany({ where: { email: normalized, acceptedAt: null } });

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await prisma.invitation.create({
      data: { email: normalized, name: String(name).trim(), role: inviteRole, token, expiresAt, createdById: req.user.id },
    });

    let frontendBase = (process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/+$/, '');
    if (frontendBase && !/^https?:\/\//i.test(frontendBase)) {
      frontendBase = `https://${frontendBase}`;
    }
    const inviteUrl = `${frontendBase}/accept-invite?token=${token}`;
    sendInviteEmail({
      to: normalized,
      name: String(name).trim(),
      role: inviteRole,
      inviteUrl,
    }).catch(console.error);
    res.status(201).json({
      invitation: { id: invite.id, email: invite.email, name: invite.name, role: invite.role, expiresAt },
      inviteUrl, // delivered by email in production; surfaced here for dev
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/invites — pending invitations
router.get('/invites', async (req, res, next) => {
  try {
    const invites = await prisma.invitation.findMany({
      where: { acceptedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      invitations: invites.map((i) => ({
        id: i.id,
        email: i.email,
        name: i.name,
        role: i.role,
        expiresAt: i.expiresAt,
        url: `/accept-invite?token=${i.token}`,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/invites/:id — revoke a pending invitation
router.delete('/invites/:id', async (req, res, next) => {
  try {
    await prisma.invitation.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Invitation revoked' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Invitation not found' });
    next(err);
  }
});

// PATCH /api/users/:id — activate/deactivate or rename; role changes are
// SUPER_ADMIN-only. HODs cannot touch other admins/super admins.
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (!canManage(req.user, target.role)) {
      return res.status(403).json({ error: 'You cannot manage this user' });
    }
    if (target.id === req.user.id && req.body.isActive === false) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    const data = {};
    if (typeof req.body.isActive === 'boolean') data.isActive = req.body.isActive;
    if (req.body.name) data.name = String(req.body.name).trim();
    if (req.body.role) {
      if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Only the super admin can change roles' });
      }
      data.role = String(req.body.role).toUpperCase();
    }

    const updated = await prisma.user.update({ where: { id }, data });
    res.json({ user: publicUser(updated), note: updated.isActive ? undefined : 'Account deactivated — login is now blocked' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id — hard-deletes when there is no dependent data,
// otherwise deactivates the account so historical records stay intact.
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (!canManage(req.user, target.role)) {
      return res.status(403).json({ error: 'You cannot remove this user' });
    }
    if (target.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super admin accounts cannot be removed' });
    }

    const [docs, subjects, statuses] = await Promise.all([
      prisma.document.count({ where: { uploadedById: id } }),
      prisma.subject.count({ where: { teacherId: id } }),
      prisma.studentStatus.count({ where: { studentId: id } }),
    ]);

    if (docs > 0 || subjects > 0 || statuses > 0) {
      await prisma.user.update({ where: { id }, data: { isActive: false } });
      return res.json({
        message: `User has dependent records (${docs} documents, ${subjects} subjects, ${statuses} statuses) — account deactivated instead of deleted.`,
        deactivated: true,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.facultyProfile.deleteMany({ where: { userId: id } });
      await tx.studentStatus.deleteMany({ where: { studentId: id } });
      await tx.user.delete({ where: { id } });
    });
    res.json({ message: 'User permanently removed', deactivated: false });
  } catch (err) {
    next(err);
  }
});

export default router;
