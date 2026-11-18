# Yester Local Development & Operations Guide

**Application Architecture:** Monorepo (`apps/web` + `apps/api`)  
**Backend:** NestJS, Prisma ORM, PostgreSQL 16  
**Frontend:** React 18, Vite 5, Tailwind CSS  

---

## 1. Prerequisites

* **Node.js:** v20.x or v22.x (`node -v`)
* **npm:** v10.x or higher (`npm -v`)
* **Docker & Docker Compose:** For running local PostgreSQL (`docker compose version`)

---

## 2. Quickstart Guide

### 2.1 Clone & Install Dependencies
From the repository root:
```bash
# Install dependencies across all monorepo workspaces (apps/web and apps/api)
npm install
```

### 2.2 Configure Environment Variables
Copy the template `.env.example` to `.env`:
```bash
cp .env.example .env
cp .env.example apps/api/.env
```

Default configuration:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yester_db?schema=public
```

### 2.3 Start PostgreSQL Container
Launch the PostgreSQL 16 container via Docker Compose:
```bash
docker compose up -d
```

Verify that the container is healthy:
```bash
docker compose ps
```
The status should indicate `Up (healthy)`.

### 2.4 Initialize Prisma Database Client
Generate the Prisma Client types:
```bash
npm run prisma:generate --workspace=@yester/api
```

Apply migrations to the database:
```bash
npm run prisma:migrate --workspace=@yester/api
```

---

## 3. Running the Applications

### 3.1 Start Frontend Development Server
From the root directory:
```bash
npm run dev:web
# or
npm run dev
```
The frontend is available at: **`http://localhost:5173`** (or `5174` if port is occupied).

### 3.2 Start Backend API Server
From the root directory:
```bash
npm run dev:api
```
The API is available at:
* Base API: **`http://localhost:3001/api/v1`**
* Interactive Swagger Docs: **`http://localhost:3001/api/docs`**
* Liveness Health Probe: **`http://localhost:3001/api/v1/health`**
* Readiness Database Probe: **`http://localhost:3001/api/v1/health/ready`**

---

## 4. Running Tests

### 4.1 Run All Tests Across Monorepo
```bash
npm test
```
Executes:
* 34 frontend tests (Pure trajectory math engine, storage persistence, and backup migrations).
* 7 backend unit tests (Health probe controller, strict environment validation).

### 4.2 Run Backend End-to-End (E2E) Tests
```bash
npm run test:e2e --workspace=@yester/api
```
Verifies real HTTP endpoints (`GET /api/v1/health` and `GET /api/v1/health/ready`) with Supertest.

### 4.3 Run Production Builds
```bash
npm run build
```
Compiles both `@yester/api` (`nest build`) and `@yester/web` (`tsc && vite build`) into their respective `dist/` folders.
