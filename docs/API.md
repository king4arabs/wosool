# API Documentation

## Overview

The Wosool API is exposed through the Laravel backend and organized around **public discovery endpoints**, **public submission endpoints**, and **authentication endpoints**. The contract is versioned as **`v1`**. Authentication uses Laravel Sanctum in stateful SPA mode — the frontend communicates over session cookies with no bearer tokens required for first-party requests.

| Base path | Purpose |
|---|---|
| `/api/health` | Liveness and service metadata |
| `/api/v1/auth/*` | Authentication (login, register, logout, current user) |
| `/api/v1/*` | Public discovery and submission contract |
| `/api/v1/member/*` | Authenticated member endpoints |

---

## Endpoint Summary

### Authentication

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/login` | No | Authenticate and start session |
| POST | `/api/v1/auth/register` | No | Create account and start session |
| POST | `/api/v1/auth/logout` | Yes | End session |
| GET | `/api/v1/auth/me` | Yes | Current authenticated user |

### Public Read Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Service health check |
| GET | `/api/v1/founders` | Paginated public founders |
| GET | `/api/v1/founders/{slug}` | Single public founder |
| GET | `/api/v1/companies` | Paginated public companies |
| GET | `/api/v1/companies/{slug}` | Single company |
| GET | `/api/v1/events` | Public events listing |
| GET | `/api/v1/events/{slug}` | Single event |
| GET | `/api/v1/programs` | Program listing |
| GET | `/api/v1/programs/{slug}` | Single program |
| GET | `/api/v1/partners` | Partner listing |
| GET | `/api/v1/sponsors` | Sponsor listing |
| GET | `/api/v1/news` | Published news listing |
| GET | `/api/v1/news/{slug}` | Single published news item |
| GET | `/api/v1/resources` | Resource listing |
| GET | `/api/v1/resources/{slug}` | Single resource |

### Public Write Endpoints (Rate Limited)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/applications` | Founder application submission |
| POST | `/api/v1/contact` | Contact form submission |

### Authenticated Member Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/member/profile` | Current user's founder profile |

---

## Authentication

Wosool uses **Laravel Sanctum** in stateful SPA mode. The frontend Next.js app communicates with the backend through session cookies — no Authorization header or bearer token is needed for first-party requests.

### Login

```
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "secret" }
```

**Success (200):**
```json
{
  "message": "Logged in successfully.",
  "user": { "id": 1, "name": "User Name", "email": "user@example.com", "roles": ["member"] }
}
```

### Register

```
POST /api/v1/auth/register
Content-Type: application/json

{ "name": "User Name", "email": "user@example.com", "password": "Password1", "password_confirmation": "Password1" }
```

**Success (201):**
```json
{
  "message": "Account created successfully.",
  "user": { "id": 2, "name": "User Name", "email": "user@example.com", "roles": [] }
}
```

### Roles and Permissions

| Role | Scope |
|---|---|
| `admin` | Full platform access (all permissions) |
| `member` | Profile, company, community, events, programs, messages |

---

## Query Patterns

| Endpoint | Supported parameters |
|---|---|
| `/founders` | `search`, `stage`, `sector`, `featured`, `per_page` |
| `/companies` | `search`, `stage`, `sector`, `featured`, `per_page` |
| `/events` | `upcoming`, `type`, `per_page` |
| `/programs` | `open` |
| `/partners` | `type` |
| `/news` | `category`, `featured`, `per_page` |
| `/resources` | `type`, `category`, `members_only`, `per_page` |

---

## Response Notes

Read endpoints return JSON collections or objects. Submission endpoints return confirmation payloads. Auth endpoints return user objects with role information.

### Health Response

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-04-08T00:00:00+00:00"
}
```

### Application Submission Response

```json
{
  "message": "Application submitted successfully. We will review it and get back to you within 5-7 business days.",
  "reference": "WOS-00001"
}
```

### Contact Submission Response

```json
{
  "message": "Thank you for reaching out. We will get back to you within 2-3 business days."
}
```

---

## Validation and Protection

| Control | Current state |
|---|---|
| Form Request validation | Implemented for submission endpoints |
| Rate limiting | Implemented on public write endpoints (10/min) |
| Authentication | Sanctum SPA sessions for protected endpoints |
| RBAC | Spatie permissions with admin and member roles |
| OpenAPI export | Planned |

---

## Contract Evolution Guidance

The API should continue evolving through backward-compatible additions where possible. Breaking contract changes should trigger a versioning review, an ADR entry, and a changelog update.
