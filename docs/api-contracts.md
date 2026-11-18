# Yester API Contracts & Endpoint Specification

**Document Version:** 1.0.0  
**API Version:** v1 (`/api/v1`)  
**Documentation:** OpenAPI / Swagger (`/api/docs`)  
**Format:** REST / JSON  

---

## 1. Global Conventions

### 1.1 Base URL & Versioning
All API endpoints are namespaced with the version prefix:
```
http://localhost:3001/api/v1/
```

### 1.2 Centralized Error Response (RFC 7807)
All errors return the standard RFC 7807 Problem Details format:
```json
{
  "type": "https://yester.app/errors/validation-failed",
  "title": "Bad Request",
  "status": 400,
  "detail": "One or more validation constraints failed.",
  "instance": "/api/v1/entries",
  "code": "VALIDATION_FAILED",
  "errors": [
    "title must be a string",
    "category must be one of: WORK, FITNESS, LEARNING, PROJECT, PERSONAL"
  ],
  "timestamp": "2026-11-18T06:50:00.000Z"
}
```

---

## 2. Endpoints Roadmap

### 2.1 Health & Operational Probes
| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Process liveness probe | `200 OK` |
| `GET` | `/api/v1/health/ready` | Database connection readiness probe | `200 OK`, `503 Service Unavailable` |

#### Response `GET /api/v1/health`
```json
{
  "status": "ok",
  "timestamp": "2026-11-18T06:50:00.000Z",
  "uptime": 124,
  "version": "v1"
}
```

#### Response `GET /api/v1/health/ready`
```json
{
  "status": "ready",
  "database": "connected",
  "timestamp": "2026-11-18T06:50:00.000Z"
}
```

---

### 2.2 Users & Sovereign Identity
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/users/:id` | Retrieve user profile by ID |

---

### 2.3 Daily Records
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/daily-records/:date?userId=:id` | Get daily record for a calendar date (`YYYY-MM-DD`) with linked entries |

#### Response `GET /api/v1/daily-records/2026-11-16?userId=...`
```json
{
  "id": "7b0d912b-3482-4f3b-85ef-9694e2ab9a42",
  "userId": "c56a4180-65aa-42ec-a945-5fd21dec0538",
  "date": "2026-11-16T00:00:00.000Z",
  "headline": "Backend Monorepo Restructuring & NestJS Bootstrap",
  "healthData": {
    "sleepHours": 7.5,
    "waterMl": 2500,
    "habits": [{ "id": "h1", "title": "Morning Meditation", "completed": true }]
  },
  "reflection": {
    "wentWell": "Restructured monorepo without losing git history.",
    "improvements": "Ensure persistent database migrations."
  },
  "entries": [
    {
      "id": "e43b10ea-523e-46cb-b80c-a6983fb08d95",
      "category": "WORK",
      "title": "Monorepo scaffolding in apps/web and apps/api",
      "planId": "p123",
      "planContribution": 3.5,
      "payload": { "branch": "main", "repo": "rushikeshxdev/Yester" },
      "revision": 1
    }
  ],
  "revision": 1
}
```

---

### 2.4 Entries
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/entries/:id?userId=:id` | Retrieve single entry by ID |

---

### 2.5 Life Plans & Dynamic Trajectory Progress
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/plans?userId=:id` | List user plans with dynamically derived `currentValue` and `progressPercent` |
| `GET` | `/api/v1/plans/:id?userId=:id` | Get plan details with dynamically evaluated milestones |

#### Response `GET /api/v1/plans/:id`
```json
{
  "id": "p123",
  "userId": "c56a4180-65aa-42ec-a945-5fd21dec0538",
  "title": "Master Distributed Backend Architecture",
  "category": "LEARNING",
  "targetValue": 100,
  "startDate": "2026-11-01T00:00:00.000Z",
  "targetDate": "2026-12-31T00:00:00.000Z",
  "pacingType": "LINEAR",
  "status": "ACTIVE",
  "currentValue": 25.5,
  "progressPercent": 25.5,
  "milestones": [
    {
      "id": "m1",
      "targetPercent": 25,
      "targetValue": 25,
      "isReached": true
    },
    {
      "id": "m2",
      "targetPercent": 50,
      "targetValue": 50,
      "isReached": false
    }
  ],
  "revision": 1
}
```

---

### 2.6 Analytics & Archive Statistics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/summary?userId=:id` | High-level personal archive statistics |

#### Response `GET /api/v1/analytics/summary`
```json
{
  "userId": "c56a4180-65aa-42ec-a945-5fd21dec0538",
  "totalRecords": 45,
  "totalEntries": 192,
  "activePlans": 4,
  "generatedAt": "2026-11-18T06:50:00.000Z"
}
```

---

### 2.7 Preferences
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/preferences?userId=:id` | Retrieve user UI theme and layout settings |
