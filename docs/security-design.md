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

## 3. Stage 2 Authentication Blueprint

While Stage 1 establishes module boundaries using explicit `userId` parameter verification, Stage 2 will introduce production-grade authentication:

1. **Password Hashing:** Passwords hashed using **Argon2id** with high memory cost parameters.
2. **Stateless JWT Tokens:** Short-lived Access Tokens (15-minute expiration) signed via RS256 or HS256.
3. **Rotating Refresh Tokens:** HttpOnly, Secure, SameSite=Strict cookies with cryptographic rotation and family revocation on reuse detection.
4. **Current User Decorator:** A custom `@CurrentUser()` parameter decorator extracting the validated user identity from `request.user`.
