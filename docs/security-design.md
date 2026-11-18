# Yester Security & Privacy Architecture

**Document Version:** 1.0.0  
**Target:** Data Ownership, Sovereign Protection & Attack Surface Hardening  
**Scope:** Stage 1 Foundation & Stage 2 Authentication Blueprint  

---

## 1. Security Architecture Principles

Yester records sensitive personal thoughts, health metrics, professional achievements, and reflections. The security architecture is designed to enforce complete user data isolation and prevent data leaks.

---

## 2. Implemented Defense-in-Depth Mechanisms

### 2.1 Parameterized Queries & ORM Protection
* All database interactions are executed via Prisma ORM's strictly parameterized query builder.
* Direct string interpolation into SQL queries is prohibited.
* Input values cannot escape parameter boundaries, completely eliminating SQL injection vectors.

### 2.2 Strict HTTP Boundary Validation
* NestJS `ValidationPipe` is registered globally with:
  ```typescript
  new ValidationPipe({
    whitelist: true,              // Strips unexpected, non-whitelisted fields
    forbidNonWhitelisted: true,   // Rejects requests with extraneous properties
    transform: true,              // Coerces primitives into strongly-typed DTOs
  });
  ```
* This prevents mass-assignment vulnerabilities where malicious payloads attempt to manipulate privileged fields like `userId`, `id`, or `revision`.

### 2.3 Strict Multi-Entity Tenant Isolation (Rule #5)
* In a multi-tenant backend, cross-user manipulation is a critical threat.
* Yester enforces strict ownership matching across relational hierarchies:
  ```typescript
  // A DailyEntry, its DailyRecord, and its linked LifePlan must belong to the same user
  if (plan && plan.userId !== authenticatedUserId) {
    throw new BadRequestException('Linked plan does not belong to the authenticated user');
  }
  ```
* Additionally, database-level composite unique constraints (`LifePlan(id, userId)`) and indexed lookups guarantee cross-tenant linking is impossible.

### 2.4 Error Sanitization & Information Leak Prevention
* Internal database connection strings, table names, query strings, and stack traces are never exposed in API error responses.
* The centralized `HttpExceptionFilter` formats all exceptions as standardized RFC 7807 Problem Details.
* In production, unhandled exceptions return a generic message:
  ```json
  {
    "type": "https://yester.app/errors/internal-error",
    "title": "Internal Server Error",
    "status": 500,
    "detail": "An unexpected error occurred. Please try again later.",
    "instance": "/api/v1/entries",
    "code": "INTERNAL_ERROR",
    "timestamp": "2026-11-18T06:50:00.000Z"
  }
  ```

### 2.5 Cross-Origin Resource Sharing (CORS)
* The API enforces origin restrictions, allowing requests only from authorized frontend origins (`http://localhost:5173`, `http://localhost:5174`, or the environment variable `CORS_ORIGIN`).
* Credentials (`cookies`, `Authorization` headers) are explicitly permitted only for whitelisted origins.

---

## 3. Stage 2 Authentication & Session Architecture

1. **Password Hashing:** Passwords hashed using **Argon2id** (memory cost: 65536, time cost: 3).
2. **Stateless JWT Access Tokens:** Short-lived Access Tokens (15-minute expiration) kept in-memory on the client, never in localStorage.
3. **Multi-Device `AuthSession` Architecture:**
   * A dedicated `auth_sessions` table stores session metadata (`id`, `user_id`, `refresh_token_hash`, `user_agent`, `ip_address`, `is_revoked`, `expires_at`).
   * Refresh tokens are stored strictly as cryptographic hashes, never plaintext.
4. **Token Rotation & Family Revocation:**
   * Each token refresh generates a new access token and a new refresh token.
   * If a revoked or expired token is presented (reuse attempt), all active sessions for that user family are revoked immediately.
5. **Secure Cookie Transport & CSRF Protection:**
   * Refresh tokens are transported exclusively via `HttpOnly, Secure, SameSite=Strict` cookies.
   * Endpoints accepting refresh cookies (`/auth/refresh`, `/auth/logout`) enforce CSRF protection.
6. **Strict Route Protection:**
   * Global `JwtAuthGuard` applied across the entire API by default.
   * Only `/auth/register`, `/auth/login`, `/auth/refresh`, and `/health/*` are granted `@Public()` exceptions.
   * `GET /auth/me` and `POST /auth/logout` require valid JWT authentication.
7. **Rate Limiting:** IP and user-based throttling on authentication endpoints via `@nestjs/throttler` to prevent brute-force attacks.
8. **Log Sanitization:** Passwords, JWTs, refresh tokens, and personal journal content are strictly excluded from logging.
