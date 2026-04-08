# Testing

## Testing Strategy

Wosool uses a layered testing approach intended to improve reliability without slowing early-stage delivery. The immediate priority is protecting the current public API contract and ensuring the frontend remains buildable and lint-clean.

| Test layer | Current status | Purpose |
|---|---|---|
| Frontend lint | Active | Catch obvious code-quality issues |
| Frontend production build | Active | Validate route and bundle integrity |
| Backend feature tests | Introduced in `0.3.0` | Protect public endpoint behavior |
| Backend unit tests | Minimal | Expand as domain logic deepens |
| End-to-end tests | Not started | Add after auth and live flows mature |

---

## Current Quality Gate

A release should not be considered healthy unless these checks pass:

| Check | Command |
|---|---|
| Frontend lint | `cd frontend && npm run lint` |
| Frontend build | `cd frontend && npm run build` |
| Backend tests | `cd backend && php artisan test` |
| CI workflow | GitHub Actions on push and pull request |

---

## Backend Test Focus

The first backend test wave should concentrate on:

| Area | Why it matters |
|---|---|
| Health endpoint | Supports infrastructure confidence |
| Public read endpoints | Protects the current discovery contract |
| Submission endpoints | Protects user-facing form workflows |
| Validation failures | Prevents silent contract drift |

---

## Next Testing Priorities

After `0.3.0`, testing should expand to frontend component tests, integration tests for public pages consuming the API, authenticated flow tests, and eventually end-to-end coverage for critical funnel journeys.
