# Architecture

## Repository shape

Wosool is a two-application monorepo:

- `frontend/` — Next.js 16 App Router frontend for the public site and dashboard shells
- `backend/` — Laravel 13 API and seed-driven content model
- `scripts/` — repository-level operational helpers
- `docs/` — repo documentation and runbooks

## Frontend

- Framework: Next.js 16
- Language: TypeScript
- Styling: Tailwind CSS 4
- UI: Radix UI primitives with shadcn/ui patterns

The frontend ships public marketing pages plus member/admin shells for the network experience.

## Backend

- Framework: Laravel 13
- Runtime: PHP 8.3+
- Auth: Laravel Sanctum
- Data model: founders, companies, events, programs, partners, sponsors, news, applications, scorecards

The API surface lives under `/api/v1` and is designed for a content-rich founder network workflow.

## Operational boundary

- Frontend validation runs on Node 20-compatible tooling (`npm run lint`, `npm run build`)
- Backend validation runs through Composer and Laravel test commands
- SSL/DNS remediation is documented separately in [SSL_RUNBOOK.md](./SSL_RUNBOOK.md)
