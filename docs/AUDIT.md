# Wosool — Security and Compliance Audit

## Last Reviewed

2026-04-05

## Dependency Audit

### Frontend (Next.js 16 + React 19)

| Check | Status | Notes |
|-------|--------|-------|
| `@tootallnate/once` (GHSA-vpq2-c234-7xj6) | **Not applicable** | This project does not use `jest` or `react-scripts`. Not in dependency tree. |
| `nth-check` (GHSA-rp65-9cf3-cjxr) | **Not applicable** | This project does not use `react-scripts` or `svgo`. Not in dependency tree. |
| Known CVEs in direct deps | **None found** | As of 2026-04-05 |

### Backend (Laravel 12 + PHP 8.3)

| Check | Status | Notes |
|-------|--------|-------|
| `axios` | **Pinned** | `>=1.11.0 <=1.14.0` per Laravel security advisory |
| `phpunit` | **Updated** | `^12.5.12` addresses known CVE |

### Why Mentioned Vulnerabilities Do Not Apply

The problem statement references:
- **`@tootallnate/once`** — pulled via `jest`. This project uses **ESLint** (not Jest) for validation.
- **`nth-check`** — pulled via `react-scripts/svgo`. This project uses **Next.js 16** (not Create React App/react-scripts).

Neither `jest`, `react-scripts`, `@tootallnate/once`, nor `nth-check` appear in `frontend/package-lock.json`.

## Optional Peer Dependencies

The following optional peer dependencies may produce warnings during `npm install`. They are **non-blocking** and do not affect functionality:

| Package | Required By | Impact |
|---------|------------|--------|
| `encoding` | `node-fetch` (optional) | Only needed for non-UTF-8 encoding support |
| `bufferutil` | `ws` (optional) | Native performance optimization for WebSockets |
| `utf-8-validate` | `ws` (optional) | Native UTF-8 validation for WebSockets |

**Recommendation:** Do not install these unless a specific feature requires them. They add native compilation dependencies without meaningful benefit for this project.

## Code Hygiene

- No `TODO`, `FIXME`, `HACK`, or `BUG` comments in source code
- ESLint configured for frontend
- Laravel Pint configured for backend PHP

## SSL/TLS

See [SSL_RUNBOOK.md](./SSL_RUNBOOK.md) for certificate status and operational procedures.

## Content Safety

- No hardcoded secrets in source code
- `.env` files are gitignored
- Partner status labels enforce verified/prospective distinction
- No fabricated quotes from public figures
