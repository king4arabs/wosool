# API Documentation

## Overview

The current Wosool API is exposed through the Laravel backend and organized around **public discovery endpoints** plus **public submission endpoints**. The contract is currently versioned as **`v1`** for public resources, while the health endpoint remains unversioned for infrastructure checks.

| Base path | Purpose |
|---|---|
| `/api/health` | Liveness and service metadata |
| `/api/v1/*` | Public discovery and submission contract |

---

## Endpoint Summary

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
| POST | `/api/v1/applications` | Founder application submission |
| POST | `/api/v1/contact` | Contact form submission |

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

Read endpoints return JSON collections or objects from the current API controllers. Submission endpoints return confirmation payloads and, in the case of applications, a generated reference code.

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
| Rate limiting | Implemented on public write endpoints |
| Authentication | Not required for current public endpoints |
| OpenAPI export | Planned |

---

## Contract Evolution Guidance

The API should continue evolving through backward-compatible additions where possible. Breaking contract changes should trigger a versioning review, an ADR entry, and a changelog update.
