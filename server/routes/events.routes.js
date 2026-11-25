import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import multer from 'multer';
import prisma from '../db.js';
import { requireRole } from '../auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const VALID_STATUSES = ['DRAFT', 'PUBLISHED'];
const EVENT_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'events');
if (!fs.existsSync(EVENT_UPLOAD_DIR)) {
  fs.mkdirSync(EVENT_UPLOAD_DIR, { recursive: true });
}

const ALLOWED_IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, EVENT_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 12);
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max for event banners
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      return cb(new Error(`Invalid image type: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

function parseEventId(rawId) {
  const id = Number.parseInt(rawId, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseEventDate(rawDate) {
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeOptionalString(val) {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function removeLocalEventImageIfOwned(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  const prefix = '/api/events/images/';
  if (!imageUrl.startsWith(prefix)) return;
  const safeName = path.basename(imageUrl.slice(prefix.length));
  if (!safeName) return;
  fs.unlink(path.join(EVENT_UPLOAD_DIR, safeName), () => {});
}

// GET /api/events/images/:filename
// PUBLIC: Serve uploaded event banner images.
router.get('/images/:filename', (req, res) => {
  const safeName = path.basename(req.params.filename || '');
  if (!safeName) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filePath = path.join(EVENT_UPLOAD_DIR, safeName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Event image not found' });
  }
  res.sendFile(filePath);
});

// POST /api/events/upload
// SUPER_ADMIN ONLY: Upload an event banner image and receive its public URL.
router.post(
  '/upload',
  requireRole('SUPER_ADMIN'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'image file is required' });
    }
    res.status(201).json({
      imageUrl: `/api/events/images/${req.file.filename}`,
      fileName: req.file.originalname,
    });
  },
);

// GET /api/events
// PUBLIC: Returns PUBLISHED events only (supports ?scope=upcoming|past|all and ?featured=true).
// SUPER_ADMIN: Pass ?includeDrafts=true (with valid SUPER_ADMIN JWT) to fetch both DRAFT and PUBLISHED events.
router.get('/', async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const includeDrafts = isSuperAdmin && req.query.includeDrafts === 'true';
    const scope = String(req.query.scope || 'all').toLowerCase();
    const featuredOnly = req.query.featured === 'true';

    const where = {};

    if (!includeDrafts) {
      where.status = 'PUBLISHED';
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (scope === 'upcoming') {
      where.eventDate = { gte: startOfToday };
    } else if (scope === 'past') {
      where.eventDate = { lt: startOfToday };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy:
        scope === 'past'
          ? [{ eventDate: 'desc' }, { id: 'desc' }]
          : [{ eventDate: 'asc' }, { id: 'desc' }],
    });

    res.json({ events });
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id
// PUBLIC: Returns a single PUBLISHED event (SUPER_ADMIN can also view DRAFT events).
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseEventId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    if (event.status !== 'PUBLISHED' && !isSuperAdmin) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (err) {
    next(err);
  }
});

// POST /api/events
// SUPER_ADMIN ONLY: Create a new event (defaults to DRAFT unless status='PUBLISHED').
router.post('/', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const {
      title,
      description,
      imageUrl,
      eventDate,
      startTime,
      endTime,
      venue,
      status,
      isFeatured,
    } = req.body || {};

    const cleanTitle = normalizeOptionalString(title);
    const cleanDescription = normalizeOptionalString(description);
    const cleanVenue = normalizeOptionalString(venue);
    const parsedDate = parseEventDate(eventDate);

    if (!cleanTitle) {
      return res.status(400).json({ error: 'Event title is required' });
    }
    if (!cleanDescription) {
      return res.status(400).json({ error: 'Event description is required' });
    }
    if (!cleanVenue) {
      return res.status(400).json({ error: 'Event venue is required' });
    }
    if (!parsedDate) {
      return res.status(400).json({ error: 'Valid eventDate is required' });
    }

    const resolvedStatus = status ? String(status).toUpperCase() : 'DRAFT';
    if (!VALID_STATUSES.includes(resolvedStatus)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const event = await prisma.event.create({
      data: {
        title: cleanTitle,
        description: cleanDescription,
        imageUrl: normalizeOptionalString(imageUrl),
        eventDate: parsedDate,
        startTime: normalizeOptionalString(startTime),
        endTime: normalizeOptionalString(endTime),
        venue: cleanVenue,
        status: resolvedStatus,
        isFeatured: Boolean(isFeatured),
        createdById: req.user.id,
      },
    });

    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id
// SUPER_ADMIN ONLY: Full update of an existing event.
router.put('/:id', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const id = parseEventId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const {
      title,
      description,
      imageUrl,
      eventDate,
      startTime,
      endTime,
      venue,
      status,
      isFeatured,
    } = req.body || {};

    const cleanTitle =
      title !== undefined ? normalizeOptionalString(title) : existing.title;
    const cleanDescription =
      description !== undefined
        ? normalizeOptionalString(description)
        : existing.description;
    const cleanVenue =
      venue !== undefined ? normalizeOptionalString(venue) : existing.venue;
    const parsedDate =
      eventDate !== undefined ? parseEventDate(eventDate) : existing.eventDate;

    if (!cleanTitle) {
      return res.status(400).json({ error: 'Event title is required' });
    }
    if (!cleanDescription) {
      return res.status(400).json({ error: 'Event description is required' });
    }
    if (!cleanVenue) {
      return res.status(400).json({ error: 'Event venue is required' });
    }
    if (!parsedDate) {
      return res.status(400).json({ error: 'Valid eventDate is required' });
    }

    const resolvedStatus =
      status !== undefined ? String(status).toUpperCase() : existing.status;
    if (!VALID_STATUSES.includes(resolvedStatus)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const nextImageUrl =
      imageUrl !== undefined
        ? normalizeOptionalString(imageUrl)
        : existing.imageUrl;

    if (existing.imageUrl && existing.imageUrl !== nextImageUrl) {
      removeLocalEventImageIfOwned(existing.imageUrl);
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: cleanTitle,
        description: cleanDescription,
        imageUrl: nextImageUrl,
        eventDate: parsedDate,
        startTime:
          startTime !== undefined
            ? normalizeOptionalString(startTime)
            : existing.startTime,
        endTime:
          endTime !== undefined
            ? normalizeOptionalString(endTime)
            : existing.endTime,
        venue: cleanVenue,
        status: resolvedStatus,
        isFeatured:
          isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
      },
    });

    res.json({ event });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/events/:id/status
// SUPER_ADMIN ONLY: Toggle or set status (DRAFT | PUBLISHED).
router.patch(
  '/:id/status',
  requireRole('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const id = parseEventId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }

      const nextStatus = String(req.body?.status || '').toUpperCase();
      if (!VALID_STATUSES.includes(nextStatus)) {
        return res.status(400).json({
          error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
        });
      }

      const event = await prisma.event.update({
        where: { id },
        data: { status: nextStatus },
      });

      res.json({ event });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Event not found' });
      }
      next(err);
    }
  },
);

// PATCH /api/events/:id/featured
// SUPER_ADMIN ONLY: Toggle or set featured flag for Home page showcase.
router.patch(
  '/:id/featured',
  requireRole('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const id = parseEventId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }

      if (typeof req.body?.isFeatured !== 'boolean') {
        return res.status(400).json({ error: 'isFeatured boolean is required' });
      }

      const event = await prisma.event.update({
        where: { id },
        data: { isFeatured: req.body.isFeatured },
      });

      res.json({ event });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Event not found' });
      }
      next(err);
    }
  },
);

// DELETE /api/events/:id
// SUPER_ADMIN ONLY: Permanently delete an event.
router.delete('/:id', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const id = parseEventId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await prisma.event.delete({
      where: { id },
    });

    removeLocalEventImageIfOwned(existing.imageUrl);

    res.json({ message: 'Event deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    next(err);
  }
});

export default router;