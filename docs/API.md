# API Documentation

**EO Accelerator integration, 2026-10-09:** `/api/v1/eoa/*` is the canonical application, review and participant API. The earlier gateway registration/draft/submission/onboarding/review/operations write endpoints return HTTP 410; their data is retained and owned legacy reads remain private and read-only. Ecosystem/editorial/privacy APIs remain available. See [EOA operations](EOA.md) and [integration notes](EOA-INTEGRATION-2026-10-09.md). Authenticated `GET/POST /api/v1/eoa/privacy-requests` provides owned data-rights requests and resolution tracking.

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
| GET | `/api/v1/auth/csrf-cookie` | No | Initialize the session CSRF cookie |
| POST | `/api/v1/auth/forgot-password` | No | Request a recovery email (generic response) |
| POST | `/api/v1/auth/reset-password` | No | Consume a recovery token and change the password |
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
| GET | `/api/v1/events/{slug}` | Single published public event |
| GET | `/api/v1/events/{slug}/calendar.ics` | Calendar download for a published public event |
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

All member endpoints require an authenticated session (Sanctum SPA cookie) and an approved member/admin role. They are scoped under `/api/v1/member/*`.

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

```http
POST /api/v1/member/events/{slug}/rsvp
Content-Type: application/json

{ "attendance_type": "in_person", "calendar_sync_option": "none" }
```

Attendance type is required (`in_person`, `online`, or `hybrid`). The response includes the registration state, such as `approved`, `pending_approval`, or `waitlisted`. Capacity and approval rules depend on event configuration. Ended, cancelled, closed, and ineligible events are rejected. Repeat registrations reuse the user's registration; `DELETE` on the same path marks it `cancelled_by_user`.

### Program Application

```
POST /api/v1/member/programs/{slug}/apply
{ "motivation": "I want to grow my company through this program.", "relevant_experience": "…" }
```

A user may apply at most once per program. Applications are rejected with `422` when the program is closed or its `application_deadline` has passed.

---

## Authentication

### Session and CSRF

Initialize `GET /api/v1/auth/csrf-cookie` before a browser session write. Include cookies, send `Accept: application/json`, and echo the URL-decoded `XSRF-TOKEN` cookie in the `X-XSRF-TOKEN` header on unsafe requests. First-party browser calls use the frontend `/api` proxy. Use `X-Locale: ar` or `X-Locale: en` for translated responses.

### Password recovery

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{ "email": "user@example.com" }
```

A syntactically valid email receives the same `200` message whether the account exists or the broker has already sent a link. A configured mail transport is required for delivery. Links use the configured `FRONTEND_URL`, not an incoming Host header.

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{ "email": "user@example.com", "token": "token-from-email", "password": "NewPassword1", "password_confirmation": "NewPassword1" }
```

Passwords require at least eight characters, uppercase and lowercase letters, and a number. Invalid/expired/used tokens return `422`; valid resets return `200`, rotate the remember token, and revoke database-backed sessions. Login is required after recovery. Both endpoints are limited to five requests per minute per client IP, with additional broker email throttling.

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

Registration requires an approved membership application matching the email address. An accepted application provisions member access; an ordinary unapproved account cannot use member endpoints.

```
POST /api/v1/auth/register
Content-Type: application/json

{ "name": "User Name", "email": "user@example.com", "password": "Password1", "password_confirmation": "Password1" }
```

**Success (201):**
```json
{
  "message": "Account created successfully.",
  "user": { "id": 2, "name": "User Name", "email": "user@example.com", "roles": ["member"] }
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
| `/events` | `period` (`upcoming`, `past`, `today`, `this_week`, `this_month`), `type`, `mode`, `format`, `q`, `category`, `tag`, `per_page` (1–100) |
| `/programs` | `open` |
| `/partners` | `type` |
| `/news` | `category`, `featured`, `per_page` |
| `/resources` | `type`, `category`, `members_only`, `per_page` |

---

## Event visibility and dates

Public list, detail, and calendar endpoints require public visibility and a published lifecycle state. Draft and private records return `404` on direct URLs. Internal invitations/settings and meeting join links are omitted from public JSON. Completed events are included in `period=past`; default/upcoming listings exclude them. `upcoming` uses the event end time, falling back to its start time, and sorts soonest first. `past` sorts most recent first.

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
| Rate limiting | Applications/contact/login: 10/min; registration/recovery: 5/min |
| Authentication | Sanctum SPA sessions for protected endpoints |
| RBAC | Spatie permissions with admin and member roles |
| OpenAPI export | Planned |

---

## Contract Evolution Guidance

The API should continue evolving through backward-compatible additions where possible. Breaking contract changes should trigger a versioning review, an ADR entry, and a changelog update.


## EO Accelerator gateway (2026-10-08)

See `backend/routes/gateway.php` and [operations](ACCELERATOR_OPERATIONS.md). Public: `GET /api/v1/accelerator`, `POST /api/v1/accelerator/eligibility`, `GET /api/v1/ecosystem`, `GET /api/v1/ecosystem/{slug}`. New accounts: `POST /api/v1/auth/applicant-register`; authenticated verification/resend use `/auth/email/*`. Verified owners use `GET/PUT /applicant/application`, `POST /applicant/application/submit`, and `POST /applicant/application/onboard`. Save/transition bodies require the current revision; conflict returns 409.

Assigned reviewers use `GET /review/accelerator` and `PATCH /review/accelerator/{application}`. Admin-only `/admin/accelerator/*` manages settings/resources/participants, while existing `/admin/programs/*` manages cohorts/sessions/attendance. `/admin/ecosystem` and `/admin/ecosystem/{record}` expose the editorial workflow. Applicants submit `/applicant/privacy-requests`; admins list/resolve through `/admin/privacy-requests`. All these paths have the `/api/v1` prefix. `GET /api/ready` is an unauthenticated, detail-free readiness check distinct from liveness.
## EO Riyadh Accelerator

EOA API routes are defined in `backend/routes/eoa.php` at `/api/v1/eoa`. Frontend routes are independently namespaced at `/EOA`.

| Route | Access / purpose |
| --- | --- |
| `GET /program` | Public verified facts, approved local content and confirmed partner logos |
| `POST /auth/register`, `POST /auth/resend`, `GET /auth/verify/{id}/{hash}` | Consent, rate limits, signed verification; registration requires an approved data notice |
| `GET/PUT /application`, `POST /application/submit` | Own versioned draft/submission; writes require verified email |
| `POST /documents`, `GET/DELETE /documents/{id}` | Private evidence; owner or assigned authorized review for download |
| `GET /participant`, `POST /onboarding`, `PUT /progress` | Own enrollment, checklist and progress |
| `POST /sessions/{id}/register`, `POST /feedback`, `PATCH /notifications/{id}` | Scoped participant actions |
| `GET /review`, `GET/PATCH /review/{id}`, `POST /review/{id}/assign` | Staff/assigned reviewers; lead-only final decisions |
| `GET /operations`, `PUT /operations/settings` | Staff read; leadership controls program/privacy/fee approvals |
| `POST /operations/create/{type}`, `PATCH /operations/update/{type}/{id}` | Scoped cohorts, sessions, groups, resources and announcements |
| `PATCH /operations/participants/{id}`, `PATCH /operations/organizations/{id}` | Leadership financial/enrollment and partner confirmations |
| `PATCH /operations/inquiries/{id}` | Staff manual handling state; does not send email |
| `GET /coach`, `PATCH /coach/{participant}` | Assigned coaching/progress/attendance without financial information |

Requests use Sanctum cookies/CSRF and the existing same-origin API helper. Stale application versions return 409; validation returns 422; forbidden roles/assignments return 403. Missing program setup returns 404; unapproved data collection returns 503 with an explanatory message. Global/local requirements and external dependencies are documented in [EOA.md](EOA.md).
