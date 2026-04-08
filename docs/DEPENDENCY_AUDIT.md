# Dependency Audit

> Wosool dependency inventory, vulnerability status, and audit procedures.

**Last audited:** v0.2.0 (2026-04-08)

---

## Summary

| Ecosystem | Package manager | Known vulnerabilities | Last checked |
|-----------|----------------|----------------------|-------------|
| Frontend (Node.js) | npm | 0 | 2026-04-08 |
| Backend (PHP) | Composer | 0 | 2026-04-08 |

---

## Frontend Dependencies (npm)

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.2 | React framework (App Router, Turbopack) |
| react | 19.2.4 | UI library |
| react-dom | 19.2.4 | React DOM renderer |
| @radix-ui/react-avatar | ^1.1.11 | Avatar component primitive |
| @radix-ui/react-dialog | ^1.1.15 | Dialog/modal primitive |
| @radix-ui/react-dropdown-menu | ^2.1.16 | Dropdown menu primitive |
| @radix-ui/react-navigation-menu | ^1.2.14 | Navigation menu primitive |
| @radix-ui/react-scroll-area | ^1.2.10 | Scroll area primitive |
| @radix-ui/react-slot | ^1.2.4 | Slot/asChild primitive |
| @radix-ui/react-tabs | ^1.1.13 | Tabs primitive |
| class-variance-authority | ^0.7.1 | Component variant utility |
| clsx | ^2.1.1 | Conditional classnames |
| lucide-react | ^1.7.0 | Icon library |
| tailwind-merge | ^3.5.0 | Tailwind class merging |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4 | Utility-first CSS framework |
| @tailwindcss/postcss | ^4 | PostCSS plugin for Tailwind |
| typescript | ^5 | Type checking |
| eslint | ^9 | Linting |
| eslint-config-next | 16.2.2 | Next.js ESLint config |
| @types/node | ^20 | Node.js type definitions |
| @types/react | ^19 | React type definitions |
| @types/react-dom | ^19 | React DOM type definitions |

### Audit result

```
npm audit — 0 vulnerabilities found
```

> **Note:** The frontend does NOT use `react-scripts`, `jest`, or legacy CRA
> tooling. Packages like `@tootallnate/once` and `nth-check` are **not** in the
> dependency tree.

---

## Backend Dependencies (Composer)

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| laravel/framework | ^13.0 | PHP web framework |
| laravel/sanctum | ^4.3 | API token authentication |
| laravel/tinker | ^3.0 | REPL for Laravel |
| spatie/laravel-permission | ^7.2 | Role-based access control |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| fakerphp/faker | ^1.23 | Test data generation |
| laravel/pail | ^1.2.5 | Real-time log viewer |
| laravel/pint | ^1.27 | PHP code style fixer (PSR-12) |
| mockery/mockery | ^1.6 | Mock objects for testing |
| nunomaduro/collision | ^8.6 | Better error reporting |
| phpunit/phpunit | ^12.5.12 | Testing framework |

### Audit result

```
composer audit — No known vulnerabilities found
```

---

## Audit Procedures

### Running audits locally

```bash
# Frontend
cd frontend
npm audit

# Backend
cd backend
composer audit
```

### Recommended CI integration

Add these commands to the CI pipeline (`.github/workflows/ci.yml`):

```yaml
- name: npm audit
  run: cd frontend && npm audit --audit-level=high

- name: composer audit
  run: cd backend && composer audit
```

### Automated scanning

| Tool | Scope | Status |
|------|-------|--------|
| GitHub Dependabot | Both | ⬜ Recommended — enable in repo settings |
| npm audit | Frontend | ✅ Manual (run before each release) |
| composer audit | Backend | ✅ Manual (run before each release) |
| Snyk / Socket.dev | Supply chain | ⬜ Recommended for production |

---

## Update Policy

| Cadence | Action |
|---------|--------|
| Weekly | Review Dependabot alerts (once enabled) |
| Before each release | Run `npm audit` and `composer audit` |
| Monthly | Run `npm update` and `composer update` with full test suite |
| On CVE disclosure | Assess impact, patch within SLA (see [Security](../SECURITY.md)) |

---

## Known Exceptions

None at this time. All dependencies are at current stable versions with no
known vulnerabilities.

---

## Related Documents

- [Security](../SECURITY.md) — Security policies and dependency scanning strategy
- [Deployment](../DEPLOYMENT.md) — Build commands and CI/CD pipeline
- [Operations](../OPERATIONS.md) — Operational runbooks
