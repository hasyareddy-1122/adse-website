import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { authenticate } from './auth.js';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import facultiesRoutes from './routes/faculties.routes.js';
import classesRoutes from './routes/classes.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import contentRoutes from './routes/content.routes.js';
import statusesRoutes from './routes/statuses.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Create a .env file (see .env.example).');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');


const allowedOrigins = new Set([
  'https://adse-website.onrender.com',
  'https://adse-website-clbp3ztq8-hasyareddyg-3586s-projects.vercel.app',
  'https://adse-website-git-5btcsds-reac-9fcfea-hasyareddyg-3586s-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]);


function addOrigin(url) {
  if (!url) return;
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return;
  if (!/^https?:\/\//i.test(trimmed)) {
    allowedOrigins.add(`https://${trimmed}`);
    allowedOrigins.add(`http://${trimmed}`);
  } else {
    allowedOrigins.add(trimmed);
  }
}

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach(addOrigin);
}

if (process.env.APP_URL) {
  process.env.APP_URL.split(',').forEach(addOrigin);
}


function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);

    if (
      (protocol === 'http:' || protocol === 'https:') &&
      (hostname === 'localhost' || hostname === '127.0.0.1')
    ) {
      return true;
    }

    if (
      protocol === 'https:' &&
      hostname.endsWith('.onrender.com') &&
      hostname.includes('adse')
    ) {
      return true;
    }

    // Allow Vercel deployments belonging to this project/team only.
    if (
      protocol === 'https:' &&
      hostname.endsWith('-hasyareddyg-3586s-projects.vercel.app') &&
      hostname.startsWith('adse-website-')
    ) {
      return true;
    }
  } catch {
    // Invalid URL format
  }

  return false;
}


const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));

// Minimal security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Tiny request logger
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Public health check endpoint (no auth required)
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() }));

// Attach req.user when a valid Bearer token is present (never blocks GETs)
app.use('/api', authenticate);

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/faculties', facultiesRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/statuses', statusesRoutes);

// Unknown API routes -> JSON 404
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));

// Static assets that ship with the repo (faculty.json fallback, images)
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// Built React app (vite build -> dist/) takes precedence when present
const DIST_DIR = path.join(__dirname, '..', 'dist');
const hasDist = fs.existsSync(DIST_DIR);
if (hasDist) app.use(express.static(DIST_DIR));

// SPA history fallback for client-side routes like /login or /dashboard
app.get('*', (_req, res, next) => {
  if (!hasDist) return next();
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err && err.name === 'MulterError') {
    const msg =
      err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 25 MB limit' : `Upload error: ${err.message}`;
    return res.status(400).json({ error: msg });
  }
  if (err && err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this unique value already exists' });
  }
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ADSE backend running on port ${PORT}${hasDist ? ' (serving API + dist)' : ' (API only)'}`);
});

export default app;
