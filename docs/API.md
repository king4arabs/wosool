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
| GET | `/api/v1/member/profile` | Current user's founder profile (legacy alias) |
| GET | `/api/v1/member/founder-profile` | Show authenticated user's founder profile |
| PUT | `/api/v1/member/founder-profile` | Create or update authenticated user's founder profile |
| GET | `/api/v1/member/companies` | List companies linked to the authenticated user's founder profile |
| POST | `/api/v1/member/companies` | Create a company and link it to the founder profile |
| PUT | `/api/v1/member/companies/{company}` | Update a company owned by the founder profile |
| DELETE | `/api/v1/member/companies/{company}` | Soft-delete a company link owned by the founder profile |
| GET | `/api/v1/member/events/rsvps` | List the authenticated user's event RSVPs |
| POST | `/api/v1/member/events/{slug}/rsvp` | RSVP to an event (auto-waitlist when full) |
| DELETE | `/api/v1/member/events/{slug}/rsvp` | Cancel an event RSVP |
| GET | `/api/v1/member/program-applications` | List the authenticated user's program applications |
| POST | `/api/v1/member/programs/{slug}/apply` | Apply to an open program |

---

## Member Workflows

All member endpoints require an authenticated session (Sanctum SPA cookie). They are scoped under `/api/v1/member/*`.

### Founder Profile

```
PUT /api/v1/member/founder-profile
Content-Type: application/json

{
  "tagline": "Building Islamic fintech",
  "bio": "Ex-McKinsey, 2x founder…",
  "sector": "FinTech",
  "stage": "seed",
  "needs": ["Investors", "Mentors"],
  "offers": ["Strategy"]
}
```

The endpoint is an upsert: it returns `201` the first time the profile is created (slug derived from the user name) and `200` on subsequent updates.

### Companies

```
POST /api/v1/member/companies
{ "name": "Acme Inc", "sector": "SaaS", "stage": "seed", "role": "CEO", "is_primary": true }
```

`PUT`/`DELETE /api/v1/member/companies/{id}` enforce ownership: only companies linked to the caller's founder profile are accessible.

### Event RSVP

```
POST /api/v1/member/events/{slug}/rsvp     → { "message": "RSVP confirmed.", "status": "confirmed" }
```

When the event reaches `max_attendees`, the next RSVP is automatically waitlisted (`status: "waitlisted"`). Repeat RSVPs from the same user are idempotent. `DELETE` on the same path cancels the RSVP.

### Program Application

```
POST /api/v1/member/programs/{slug}/apply
{ "motivation": "I want to grow my company through this program.", "relevant_experience": "…" }
```

A user may apply at most once per program. Applications are rejected with `422` when the program is closed or its `application_deadline` has passed.

---

## Authentication

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
