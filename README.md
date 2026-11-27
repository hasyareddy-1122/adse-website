````markdown
# Department of AI, ML & Data Science — CHRIST (Deemed to be University), Kengeri Campus

Full-stack departmental web platform for the **Department of Artificial Intelligence, Machine Learning & Data Science** at CHRIST (Deemed to be University), Bengaluru (Kengeri Campus), featuring a dynamic React + Vite frontend and a Node.js + Express + Prisma + PostgreSQL REST API with role-based content management.

---

## Key Features

- **Public Department Portal**
  - **Home & About:** Departmental vision, mission, academic highlights, announcements, and leadership overview.
  - **Faculty Directory & Detail Profiles:** Searchable and filterable faculty directory with specialization filters, academic links (Google Scholar, ORCID, ResearchGate), and role-gated campus/cabin location visibility (public visitors view the campus block; authenticated campus accounts view exact cabin/room details).
  - **Service Learning Showcase:** Filterable gallery of community engineering projects (AY 2025–26) with interactive detail modals covering community need analysis, technical implementation, and measurable outcomes.
  - **Newsletters, Events & Resources:** Dynamic department newsletters, upcoming/past events, and student/faculty resources.
- **Role-Based Admin & Faculty Dashboard (`/dashboard`)**
  - **4-Tier Role Hierarchy:** `STUDENT`, `FACULTY`, `ADMIN` (HOD), and `SUPER_ADMIN`.
  - **Faculty Self-Service:** Faculty members can update their own profile, specialization, qualification, and cabin location.
  - **Department CMS:** Admins and Super Admins manage announcements, newsletters, Service Learning projects, events, faculty profiles, and user roles.

---

## Tech Stack

| Layer                    | Technologies                                          |
| :----------------------- | :---------------------------------------------------- |
| **Frontend**             | React, React Router, Vite, Framer Motion, CSS3        |
| **Backend**              | Node.js, Express, JWT Authentication (`jsonwebtoken`) |
| **Database & ORM**       | PostgreSQL (Neon), Prisma ORM                         |
| **Hosting & Deployment** | Vercel (Frontend), Render (Backend API)               |

---

## Project Structure

```text
├── public/
│   └── images/
│       └── service-learning/   # Optimized .avif Service Learning project photos
├── src/
│   ├── assets/                 # Static banners and media assets
│   ├── components/             # Navbar, Footer, OptimizedImage, MotionPrimitives
│   ├── lib/
│   │   └── api.js              # Centralized fetch wrapper with JWT session handling
│   └── pages/
│       ├── Home.jsx            # Main landing page & faculty directory section
│       ├── AboutUs.jsx         # Department overview & leadership
│       ├── FacultyDetail.jsx   # Individual faculty profile with gated cabin location
│       ├── ServiceLearning.jsx # Service Learning partner grid & detail modal
│       ├── Dashboard.jsx       # Role-based CMS & profile editor
│       └── Login.jsx           # Authentication portal
└── server/                     # Backend Express + Prisma API (deployed on Render)
    ├── auth.js                 # JWT signing, authenticate middleware & role guards
    ├── db.js                   # Prisma client instance
    └── routes/
        └── faculties.routes.js # Faculty CRUD & location-gated endpoints
```
````

---

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=[https://adse-backend-rpnx.onrender.com](https://adse-backend-rpnx.onrender.com)

```

### Backend (`server/.env`)

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000

```

---

## Local Development

### 1. Start the Backend API

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev

```

### 2. Start the Frontend

```bash
npm install
npm run dev

```

The frontend runs on `http://localhost:5173` and connects to `http://localhost:3000` by default in development mode.

---

## Production Build

```bash
npm run build

```

Push changes to the frontend branch (`5BTCSDS/react-frontend`) for automatic deployment on **Vercel**, and to the backend repository for automatic deployment on **Render**.

```

```
