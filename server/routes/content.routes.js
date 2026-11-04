
import { Router } from 'express';
import prisma from '../db.js';
import { requireRole } from '../auth.js';

const router = Router();

// Super Admin can manage all content.
// HoD (ADMIN) can manage Newsletter, Service Learning and Department Events.
function canManageContentKey(user, key) {
  if (user?.role === 'SUPER_ADMIN') {
    return true;
  }

  if (user?.role !== 'ADMIN') {
    return false;
  }

  return (
    key.startsWith('newsletter.') ||
    key.startsWith('service-learning.') ||
    key.startsWith('department.events') ||
    key.startsWith('department.activities')
  );
}

// GET /api/content
// PUBLIC: Return all content as a map of { key: parsedValue }.
router.get('/', async (req, res, next) => {
  try {
    const rows = await prisma.siteContent.findMany({
      orderBy: { key: 'asc' },
    });

    const content = {};

    for (const row of rows) {
      try {
        content[row.key] = JSON.parse(row.value);
      } catch {
        content[row.key] = row.value;
      }
    }

    res.json({ content });
  } catch (err) {
    next(err);
  }
});

// GET /api/content/:key
// PUBLIC: Return one content item.
router.get('/:key', async (req, res, next) => {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: req.params.key },
    });

    if (!row) {
      return res.status(404).json({
        error: 'Content key not found',
      });
    }

    let value;

    try {
      value = JSON.parse(row.value);
    } catch {
      value = row.value;
    }

    res.json({
      key: row.key,
      value,
      updatedAt: row.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});


// PUT /api/content/:key
// SUPER_ADMIN: any key.
// ADMIN (HoD): newsletter.*, service-learning.* and department.events*.
router.put(
  '/:key',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { key } = req.params;

      if (!canManageContentKey(req.user, key)) {
        return res.status(403).json({
          error: 'You cannot manage this content key.',
        });
      }

      const { value } = req.body || {};

      if (value === undefined) {
        return res.status(400).json({
          error: 'value is required',
        });
      }

      const stored = JSON.stringify(value);

      const row = await prisma.siteContent.upsert({
        where: { key },
        update: {
          value: stored,
          updatedById: req.user.id,
        },
        create: {
          key,
          value: stored,
          updatedById: req.user.id,
        },
      });

      res.json({
        key: row.key,
        value: JSON.parse(row.value),
        updatedAt: row.updatedAt,
      });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/content/:key
// SUPER_ADMIN: any key.
// ADMIN (HoD): newsletter.*, service-learning.* and department.events*.
router.delete(
  '/:key',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { key } = req.params;

      if (!canManageContentKey(req.user, key)) {
        return res.status(403).json({
          error: 'You cannot manage this content key.',
        });
      }

      await prisma.siteContent.delete({
        where: { key },
      });

      res.json({
        message: 'Content key deleted',
      });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({
          error: 'Content key not found',
        });
      }

      next(err);
    }
  },
);

export default router;
