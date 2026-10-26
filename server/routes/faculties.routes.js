import { Router } from 'express';
import prisma from '../db.js';
import { requireMinRole, requireRole } from '../auth.js';

const router = Router();
const DEFAULT_DEPARTMENT = 'AI, ML AND DATA SCIENCE';
const PROFILE_FIELDS = [
  'name', 'department', 'specialization', 'designation', 'qualification',
  'bio', 'image', 'publicEmail', 'researchGate', 'googleScholar', 'orcid', 'website','cabinLocation',
];
const FACULTY_EDITABLE_FIELDS = [
  'name', 'specialization', 'designation', 'qualification', 'bio', 'image',
  'publicEmail', 'researchGate', 'googleScholar', 'orcid', 'website','cabinLocation',
];

function cleanText(value, maxLength = 5000) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  const text = String(value).trim();
  return text ? text.slice(0, maxLength) : null;
}

function pickFields(body, fields) {
  const data = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = cleanText(body[field], field === 'bio' ? 5000 : 500);
    }
  }
  return data;
}

function publicFaculty(f) {
  return {
    id: f.id,
    name: f.name,
    department: f.department,
    specialization: f.specialization,
    designation: f.designation,
    qualification: f.qualification,
    bio: f.bio,
    image: f.image,
    publicEmail: f.publicEmail,
    researchGate: f.researchGate,
    googleScholar: f.googleScholar,
    orcid: f.orcid,
    website: f.website,
    cabinLocation: f.cabinLocation,
    hasAccount: Boolean(f.userId),
  };
}

async function ensureOwnProfile(user) {
  return prisma.facultyProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      name: user.name,
      department: DEFAULT_DEPARTMENT,
      userId: user.id,
    },
  });
}

// GET /api/faculties — public directory. An empty database returns an empty list;
// the frontend should not mistake an empty live response for an API failure.
router.get('/', async (req, res, next) => {
  try {
    const { search, specialization } = req.query;
    const where = {};
    if (specialization && specialization !== 'All') where.specialization = String(specialization);
    if (search) {
      const term = String(search).trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { specialization: { contains: term, mode: 'insensitive' } },
        { designation: { contains: term, mode: 'insensitive' } },
      ];
    }
    const faculties = await prisma.facultyProfile.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ faculties: faculties.map(publicFaculty) });
  } catch (err) {
    next(err);
  }
});

// GET /api/faculties/specializations — public filter options.
router.get('/specializations', async (_req, res, next) => {
  try {
    const rows = await prisma.facultyProfile.findMany({
      select: { specialization: true }, distinct: ['specialization'], orderBy: { specialization: 'asc' },
    });
    res.json({ specializations: rows.map((r) => r.specialization).filter(Boolean) });
  } catch (err) {
    next(err);
  }
});

// GET /api/faculties/me — FACULTY can view their own profile in the dashboard.
router.get('/me', requireRole('FACULTY'), async (req, res, next) => {
  try {
    const faculty = await ensureOwnProfile(req.user);
    res.json({ faculty: publicFaculty(faculty) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/faculties/me — FACULTY can edit their own public profile fields only.
// Department, account link, and role remain controlled by ADMIN/HOD or SUPER_ADMIN.
router.put('/me', requireRole('FACULTY'), async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = pickFields(body, FACULTY_EDITABLE_FIELDS);
    if (data.name !== undefined && !data.name) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    const faculty = await ensureOwnProfile(req.user);
    const updated = await prisma.$transaction(async (tx) => {
      if (data.name) {
        await tx.user.update({ where: { id: req.user.id }, data: { name: data.name } });
      }
      return tx.facultyProfile.update({ where: { id: faculty.id }, data });
    });
    res.json({ faculty: publicFaculty(updated) });
  } catch (err) {
    next(err);
  }
});

// GET /api/faculties/:id — public detail page.
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid faculty id' });
    const faculty = await prisma.facultyProfile.findUnique({ where: { id } });
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
    res.json({ faculty: publicFaculty(faculty) });
  } catch (err) {
    next(err);
  }
});

// POST /api/faculties — ADMIN (HOD) / SUPER_ADMIN.
router.post('/', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = pickFields(body, PROFILE_FIELDS);
    if (!data.name) return res.status(400).json({ error: 'name is required' });
    if (data.department === undefined || !data.department) data.department = DEFAULT_DEPARTMENT;
    if (body.userId !== undefined && body.userId !== null && body.userId !== '') {
      data.userId = Number(body.userId);
      if (!Number.isInteger(data.userId) || data.userId < 1) return res.status(400).json({ error: 'Invalid userId' });
    }
    const faculty = await prisma.facultyProfile.create({ data });
    res.status(201).json({ faculty: publicFaculty(faculty) });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'That user already has a faculty profile' });
    next(err);
  }
});

// PUT /api/faculties/:id — ADMIN (HOD) / SUPER_ADMIN.
router.put('/:id', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid faculty id' });
    const body = req.body || {};
    const data = pickFields(body, PROFILE_FIELDS);
    if (data.name !== undefined && !data.name) return res.status(400).json({ error: 'Name cannot be empty' });
    if (Object.prototype.hasOwnProperty.call(body, 'userId')) {
      if (body.userId === null || body.userId === '') data.userId = null;
      else {
        data.userId = Number(body.userId);
        if (!Number.isInteger(data.userId) || data.userId < 1) return res.status(400).json({ error: 'Invalid userId' });
      }
    }
    const faculty = await prisma.facultyProfile.update({ where: { id }, data });
    res.json({ faculty: publicFaculty(faculty) });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Faculty not found' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'That user already has a faculty profile' });
    next(err);
  }
});

// DELETE /api/faculties/:id — ADMIN (HOD) / SUPER_ADMIN.
router.delete('/:id', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    await prisma.facultyProfile.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Faculty removed from the directory' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Faculty not found' });
    next(err);
  }
});

export default router;
