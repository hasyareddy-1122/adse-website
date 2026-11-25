# FitAnalysis AI — Garment Measurement, Body Pose Estimation & Wardrobe Management Platform

**React (Vite) + Node.js (TypeScript) + Python (MediaPipe) + PostgreSQL 18**

FitAnalysis AI is a web-based garment measurement and body analysis platform designed to automate clothing measurements using computer vision and pose estimation. It combines a React frontend, a TypeScript/Node.js backend, a Python MediaPipe computer vision service, and PostgreSQL 18 for persistent data storage.

The platform supports body profile creation, image capture and upload, garment measurement, reference card calibration, pose estimation, and wardrobe management. It also provides structured backend APIs, authentication, role-based access control, and database-backed workflows.

---

## 1. Technology Stack

| Layer               | Technology                                                |
| ------------------- | --------------------------------------------------------- |
| Frontend            | React, Vite, TypeScript                                   |
| Backend             | Node.js, Express.js, TypeScript                           |
| Computer Vision     | Python, MediaPipe                                         |
| Database            | PostgreSQL 18                                             |
| Database Management | Prisma ORM (where configured)                             |
| Authentication      | JWT-based authentication and role-based access control    |
| Image Processing    | Client-side image compression using `compressImageBase64` |
| Deployment          | Render / Vercel / Other compatible hosting platforms      |

---

## 2. Workflows & Capabilities

| Module / Workflow                  | Who                | Capabilities                                                                                                                                 |
| ---------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Body Profile & Capture**         | Users              | Create body profiles, capture or upload body images and garment images, and compress images before transmission using `compressImageBase64`. |
| **Pose & Garment Analysis**        | Backend CV Service | Python MediaPipe-based pose estimation and garment inference through `cv-service/main.py`.                                                   |
| **Reference Card Calibration**     | Users              | Use reference cards to calibrate image scale and improve garment measurement accuracy.                                                       |
| **Garment Measurement**            | Users / System     | Capture garment images and process them through the computer vision service to estimate measurements.                                        |
| **Wardrobe Management**            | Users              | Manage captured garments and organize wardrobe information.                                                                                  |
| **Image Processing**               | Frontend           | Downscale and compress base64 image payloads before sending requests to the backend.                                                         |
| **Database Layer**                 | System             | Store and retrieve body profiles, garment information, calibration data, and wardrobe records using PostgreSQL 18.                           |
| **API Layer**                      | System             | Expose structured endpoints for body profiles, garment categories, garment records, calibration, and wardrobe operations.                    |
| **Authentication & Authorization** | System             | Protect user-specific operations and enforce role-based permissions where authentication is enabled.                                         |

---

## 3. Project Architecture & Directory Structure

```text
FitAnalysis-AI/
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   │   └── Main application shell and image compression
│   │   │
│   │   ├── components/
│   │   │   └── BodyProfileSection.tsx
│   │   │       └── Body profile, image capture and
│   │   │           compressImageBase64 helper
│   │   │
│   │   ├── pages/
│   │   │   └── Application pages and workflows
│   │   │
│   │   └── lib/
│   │       └── API utilities and backend communication
│   │
│   └── package.json
│
├── backend/
│   └── fit-analysis-backend/
│       ├── src/
│       │   ├── routes/
│       │   │   └── API routes
│       │   │
│       │   ├── middleware/
│       │   │   └── Authentication, authorization and validation
│       │   │
│       │   ├── services/
│       │   │   └── Business logic and CV service integration
│       │   │
│       │   ├── controllers/
│       │   │   └── Request handling
│       │   │
│       │   ├── config/
│       │   │   └── Database and application configuration
│       │   │
│       │   └── server.ts
│       │
│       ├── prisma/
│       │   └── schema.prisma
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── cv-service/
│   ├── main.py
│   │   └── MediaPipe pose estimation and garment inference
│   │
│   └── requirements.txt
│
├── .env.example
└── README.md
```

_Note: The directory structure is a logical reference. Adapt file names and folders to match the actual repository._

---

## 4. Quick Start & Installation

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Python 3
- PostgreSQL 18
- Git
- A code editor such as Visual Studio Code

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd FitAnalysis-AI
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Configure the Backend

Navigate to the backend directory:

```bash
cd ../backend/fit-analysis-backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Example configuration:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fit_analysis_db"
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="7d"
CV_SERVICE_URL="http://localhost:5000"
```

Replace the database password and service URL with your actual configuration.

### Step 4: Configure PostgreSQL 18

1. Start the PostgreSQL 18 service.
2. Open pgAdmin or your PostgreSQL terminal.
3. Create a database named `fit_analysis_db`.
4. Ensure the backend's `DATABASE_URL` points to the correct database and port.
5. Apply the database schema and migrations if Prisma is configured.

```bash
npx prisma generate
npx prisma migrate dev --name init
```

For subsequent schema changes:

```bash
npx prisma migrate dev --name <change_name>
```

For production:

```bash
npx prisma migrate deploy
```

### Step 5: Start the Backend

```bash
npm run dev
```

Use the actual development script defined in the backend's `package.json`.

### Step 6: Configure the Python CV Service

Navigate to the CV service directory:

```bash
cd ../../cv-service
```

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the CV service:

```bash
python main.py
```

The service should expose the configured HTTP endpoints for pose estimation and garment analysis.

### Step 7: Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The Vite development server will provide the frontend URL, typically:

```text
http://localhost:5173
```

---

## 5. Backend API & Endpoint Overview

The backend provides structured APIs for communication between the React frontend, PostgreSQL database, and Python computer vision service.

All application API endpoints should be organized under `/api`.

| API Module          | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `/api/auth`         | Authentication, login, registration and user sessions, if enabled |
| `/api/profile`      | Body profile creation and management                              |
| `/api/categories`   | Retrieve garment categories                                       |
| `/api/garments`     | Create, retrieve, update and manage garment records               |
| `/api/calibration`  | Reference card calibration operations                             |
| `/api/measurements` | Submit and retrieve garment measurement results                   |
| `/api/wardrobe`     | Wardrobe management workflows                                     |
| `/api/cv`           | Integration with the Python MediaPipe service                     |

**Important:** These paths describe the intended API organization. Verify the actual registered routes in the backend before using them.

### Endpoint Verification

During development and testing, verify that:

- `/categories` returns the expected garment categories.
- `/garments` returns the expected garment records.
- Body profile endpoints correctly save and retrieve user data.
- Calibration requests are processed successfully.
- Garment measurement requests reach the CV service.
- Wardrobe operations correctly persist changes in PostgreSQL.
- Invalid requests return appropriate HTTP status codes.

---

## 6. Authentication & Role-Based Access Control

Where authentication and multiple user roles are enabled, the backend should enforce permissions through JWT authentication and authorization middleware.

Suggested role structure:

| Role                   | Permissions                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `SUPER_ADMIN`          | Full control over users, platform configuration, and all backend data.                                           |
| `ADMIN`                | Manage users, garment categories, platform records, and administrative operations.                               |
| `USER`                 | Create and manage personal body profiles, capture garments, perform measurements, and manage their own wardrobe. |
| **Visitor (No Login)** | Access explicitly designated public pages and publicly available information.                                    |

### Security Requirements

- JWT tokens must be verified on protected routes.
- Users should only access their own body profiles and wardrobe records.
- Administrative operations must require appropriate role permissions.
- Sensitive database operations must remain on the backend.
- File and image access should be validated before processing.
- Never expose JWT secrets or database credentials in frontend code.

_The roles above describe a recommended authorization model. Enable and enforce them according to the actual implementation._

---

## 7. Database Management

The project uses **PostgreSQL 18**, with the database named `fit_analysis_db`.

The database is responsible for persistent storage of application information.

### Database Responsibilities

- User accounts and authentication records.
- Body profiles and associated measurements.
- Garment categories and garment records.
- Reference card calibration information.
- Measurement results.
- Wardrobe records and associated metadata.

### Common Database Commands

Generate the Prisma client:

```bash
npx prisma generate
```

Create and apply a development migration:

```bash
npx prisma migrate dev --name <change_name>
```

Apply existing migrations in production:

```bash
npx prisma migrate deploy
```

Synchronize the schema without creating migration history:

```bash
npx prisma db push
```

Open Prisma Studio:

```bash
npx prisma studio
```

**Important:** Use one consistent database migration strategy. Prefer Prisma migrations for version-controlled schema changes rather than relying on `db push` in production.

---

## 8. Computer Vision & MediaPipe Integration

The Python computer vision service is responsible for pose estimation and garment image analysis.

Main implementation:

```text
cv-service/main.py
```

### Core Responsibilities

- Initialize MediaPipe models when required.
- Process uploaded body and garment images.
- Perform pose landmark detection.
- Support garment analysis and measurement workflows.
- Return processed results to the Node.js backend.
- Handle image-processing failures and invalid input safely.

### Memory Optimization for Render

Render's free instance may have a memory limit of approximately 512 MB, depending on the selected service and plan.

To reduce memory consumption:

1. Keep MediaPipe initialization lazy.
2. Avoid loading unnecessary models at application startup.
3. Release image-processing objects after requests.
4. Use explicit garbage collection where appropriate.
5. Avoid retaining large image arrays in memory.
6. Process requests efficiently and avoid unnecessary concurrent model initialization.

**Important:** Explicit garbage collection does not guarantee that the process will remain below the memory limit. Monitor actual memory usage during inference and test under realistic workloads.

---

## 9. Image Compression & Processing

The frontend uses a helper named `compressImageBase64` to reduce image payload sizes before transmitting them to the backend.

Relevant files:

```text
frontend/src/App.tsx
frontend/src/components/BodyProfileSection.tsx
```

### Image Compression Workflow

1. User captures or uploads a body or garment image.
2. The frontend processes the image through `compressImageBase64`.
3. The image is downscaled and compressed.
4. The compressed base64 payload is transmitted to the backend.
5. The backend validates the request and forwards the image to the CV service.
6. The Python service performs pose estimation or garment analysis.
7. The resulting information is returned to the frontend and persisted where required.

### Important Considerations

- Apply image size and format validation.
- Avoid transmitting unnecessarily large base64 payloads.
- Handle unsupported image formats.
- Provide meaningful error messages when compression fails.
- Validate image data on the backend instead of trusting frontend validation alone.

---

## 10. Hosting & Deployment

The application consists of three main services:

1. React frontend.
2. Node.js/TypeScript backend.
3. Python MediaPipe CV service.

These can be deployed independently.

### Option A: Split Hosting

| Component                 | Recommended Hosting                                  |
| ------------------------- | ---------------------------------------------------- |
| React + Vite Frontend     | Vercel / Netlify                                     |
| Node.js + Express Backend | Render / Railway / VPS                               |
| Python MediaPipe Service  | Render / VPS                                         |
| PostgreSQL Database       | Render PostgreSQL / Neon / Other PostgreSQL provider |

### Frontend Deployment

Build the React application:

```bash
npm run build
```

Deploy the generated `dist/` directory using Vercel or Netlify.

Configure the frontend's backend API URL using an environment variable:

```env
VITE_API_URL=https://your-backend-url
```

### Node.js Backend Deployment

Configure the backend hosting service with:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_production_secret
JWT_EXPIRES_IN=7d
CV_SERVICE_URL=https://your-cv-service-url
```

Typical deployment commands:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Adjust the commands according to the backend's actual build and start scripts.
