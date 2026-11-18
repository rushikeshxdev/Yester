# Yester Backend Architecture Assessment & System Design

**Document Version:** 1.0.0  
**Status:** Approved / Foundation Stage  
**Target System:** Yester Life OS Backend (`apps/api`)  
**Architect:** Senior Backend Engineer & System Architect  

---

## 1. Executive Summary

Yester is a sovereign personal operating system and long-term life archive. Unlike transient task trackers or generic CRUD apps, Yester records years of personal memories, technical architecture decisions, fitness biometric data, structured learning, and long-term multi-month trajectory plans.

This document establishes the architecture for **Stage 1: Complete Backend Foundation & Architecture Implementation**. It synthesizes findings from a comprehensive audit of the existing client-side React application, establishes strict domain boundaries, and outlines a resilient modular monolith using **NestJS**, **PostgreSQL**, and **Prisma**.

---

## 2. Existing Frontend Audit & Domain Assessment

### 2.1 Current Client Architecture
- **Runtime & Tooling:** React 18, TypeScript (strict mode, bundler resolution), Vite 5, Tailwind CSS, Framer Motion.
- **Persistence Mechanism:** Synchronous `localStorage` with versioned keys (`yester_records_v1`, `yester_plans_v1`, `yester_preferences_v1`).
- **Data Model:** Records are stored in a key-value dictionary keyed by calendar date string (`Record<string, DailyRecord>`).
- **Embedded Arrays:** Each `DailyRecord` contains embedded arrays for activities (`work: WorkEntry[]`, `fitness: FitnessEntry[]`, `learning: LearningEntry[]`, `projects: ProjectEntry[]`, `personal: PersonalEntry[]`) and nested objects for `health: HealthEntry` and `reflection: DailyReflection`.
- **Plans & Pure Engine:** Long-term life plans (`LifePlan`) with user-defined target values, linear/ramp-up/front-loaded pacing curves, and milestones evaluated dynamically against daily entry contributions using a pure trajectory engine (`src/services/planService.ts`).
- **Date & Temporal Assumptions:** The client strictly handles dates as calendar string keys in `YYYY-MM-DD` format (e.g., `'2026-11-16'`) using custom utilities and `date-fns`.

### 2.2 Key Findings & Architectural Gaps
1. **Lack of Independent Identity for Entries in Storage:** While frontend interfaces assign client-side UUIDs to entries, embedding them as raw arrays within an all-or-nothing daily record object prevents efficient granular updates, independent indexing, and robust conflict resolution.
2. **Timezone Vulnerability:** Storing dates as arbitrary ISO timestamps in relational databases risks unexpected day shifts upon UTC conversion. Calendar dates must be stored as true database `DATE` types.
3. **Implicit Ownership:** In `localStorage`, single-user ownership is assumed. In a multi-user backend, resource ownership must be enforced at every layer; cross-tenant references (e.g., User A linking an entry to User B's plan) must be prevented.
4. **Offline Synchronization Readiness:** The client must be able to generate records and entries offline using client-minted UUIDs. The database schema must accommodate client-generated UUIDs, monotonic revision counters, and soft-delete tombstones (`deletedAt`).

---

## 3. Proposed Backend Architecture

### 3.1 Modular Monolith with NestJS
The backend is structured as a **Modular Monolith** in NestJS. This provides clean compilation, strict dependency injection, and modular encapsulation without the operational complexity and failure modes of distributed microservices.

```
HTTP Layer (Controllers, Route Guards, Swagger)
       │
       ▼
Application Layer (Services, Use Cases, DTO Validation Pipes)
       │
       ▼
Domain Layer (Pure Business Rules, Trajectory Math, Enums)
       │
       ▼
Persistence Layer (Prisma Service, PostgreSQL Extensions, Database Migrations)
```

### 3.2 Directory Structure
The backend is placed under `apps/api/` while keeping the existing frontend at the repository root completely intact:

```
yester/
├── src/                          # Existing React frontend (untouched & operational)
├── public/
├── docs/                         # Architecture, DB, API & Sync specifications
│   ├── backend-architecture.md
│   ├── database-design.md
│   ├── api-contracts.md
│   ├── synchronization-design.md
│   ├── security-design.md
│   └── local-development.md
│
├── prisma/                       # Canonical Prisma schema & SQL migrations
│   ├── schema.prisma
│   └── migrations/
│
├── apps/
│   └── api/                      # NestJS Backend Application
│       ├── src/
│       │   ├── main.ts           # Application bootstrap & lifecycle hooks
│       │   ├── app.module.ts     # Root module orchestration
│       │   │
│       │   ├── common/           # Shared cross-cutting concerns
│       │   │   ├── filters/      # Centralized HTTP exception filter
│       │   │   ├── interceptors/ # Logging & response envelope interceptors
│       │   │   └── pipes/        # Global validation pipes
│       │   │
│       │   ├── config/           # Validated environment configuration (Zod / Joi)
│       │   │   ├── configuration.ts
│       │   │   └── validation.ts
│       │   │
│       │   ├── database/         # Persistence layer abstraction
│       │   │   ├── database.module.ts
│       │   │   └── prisma.service.ts
│       │   │
│       │   └── modules/          # Business domain modules
│       │       ├── health/       # Liveness and DB readiness probes
│       │       ├── users/        # User accounts & identity
│       │       ├── daily-records/# Journal day records envelope
│       │       ├── entries/      # Independently addressable daily entries
│       │       ├── plans/        # Life plans & milestones
│       │       ├── analytics/    # Aggregate metrics & folios
│       │       └── preferences/  # User settings & layout preferences
│       │
│       ├── test/                 # End-to-end and integration tests (Supertest + Jest)
│       ├── package.json          # Backend-specific dependencies & scripts
│       └── tsconfig.json         # Strict TypeScript configuration
│
├── docker-compose.yml            # Local PostgreSQL container with healthcheck
├── .env.example                  # Documented environment template
└── package.json                  # Root scripts (delegating to frontend and backend)
```

---

## 4. Initial Database Design & Relational Strategy

### 4.1 Hybrid Relational + Validated JSONB
- **Relational Backbone:** Core entities (`User`, `DailyRecord`, `DailyEntry`, `LifePlan`, `PlanMilestone`, `UserPreference`) have dedicated tables with UUID primary keys, foreign key constraints (`ON DELETE CASCADE`), indexes, and unique constraints.
- **Granular `DailyEntry` Table:** Rather than storing dynamic arrays in `DailyRecord`, each entry is an independent row with `category` enum (`WORK`, `FITNESS`, `LEARNING`, `PROJECT`, `PERSONAL`), optional `planId` and `planContribution`, and a validated `payload` JSONB column.
- **Envelope Attachments:** `HealthData` (habits, sleep, water, custom metrics) and `DailyReflection` (what went well, improvements, tomorrow's brief) are modeled as structured JSONB columns on `DailyRecord` in Stage 1 to minimize unnecessary join overhead while preserving future table extraction capabilities.
- **Calendar Date Integrity:** All dates are stored as PostgreSQL `DATE` types (`@db.Date`), eliminating UTC time-drift across daylight saving or user travel.
- **Milestone Evaluation Rule:** Milestones do NOT store completion status as an unverified independent boolean. Milestone completion is dynamically evaluated from valid linked contributions and plan trajectory rules.

---

## 5. API Design & Security Principles

1. **API Versioning:** All endpoints are namespaced under `/api/v1/`.
2. **Strict Validation Pipeline:** All incoming DTOs are validated at the HTTP boundary using class-validator and class-transformer with `whitelist: true` and `forbidNonWhitelisted: true`.
3. **Centralized Error Envelope:** Errors are normalized into standard RFC 7807 problem details with timestamps and request correlation IDs. Database internals, table names, and stack traces are never leaked to clients.
4. **Ownership Verification:** Every service method requires the authenticated `userId`. Queries filter by `userId`, preventing cross-tenant access.
5. **Operational Probes:**
   - `GET /api/v1/health` (Liveness probe for process uptime)
   - `GET /api/v1/health/ready` (Readiness probe executing `SELECT 1` against PostgreSQL)

---

## 6. Offline-First Synchronization Roadmap (Stage 2+)

1. **Client-Minted UUIDs:** The database accepts valid UUIDs provided by clients on record creation.
2. **Monotonic Revisions:** Every row maintains an integer `revision` incremented on updates.
3. **Tombstone Records:** Records marked as deleted retain `deletedAt` timestamps so offline clients can receive deletion events during synchronization batches.
4. **Idempotent Upserts:** Retried network requests perform idempotent updates based on record ID and incoming revision matching.

---

## 7. Scope Boundaries for Stage 1

- **Included:** NestJS framework setup, strict TypeScript configuration, Docker Compose for PostgreSQL, Prisma schema with initial migration, database service with connection lifecycle, health and readiness endpoints, module boundaries, error handling, validation, tests, and architectural documentation.
- **Explicitly Excluded:** Authentication implementation (Stage 2), full CRUD endpoints implementation (Stage 2), microservices, Redis/caching, Kafka/messaging queues, vector databases/AI processing, and live synchronization engine.
