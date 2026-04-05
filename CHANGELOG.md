# Wosool — Changelog

All notable changes to the Wosool platform are documented in this file.

## [Unreleased]

### Added
- Project documentation suite (`docs/` directory)
  - Architecture overview
  - API contract
  - Database schema documentation
  - Deployment guide
  - SSL/TLS runbook with apex vs. www guidance
  - Security and compliance audit
  - Skills profile system documentation
  - Dependency vulnerability audit
- SSL repair script (`scripts/ssl-repair.mjs`) with credential validation
- Documentation links in root README.md

### Fixed
- README.md now uses correct relative links to documentation (no hardcoded absolute paths)
- SSL repair path documented with clear operational guidance and credential guardrails

## [0.1.0] — 2024

### Added
- Initial repository structure (monorepo)
- Next.js frontend with 17 public routes
- Laravel 12 backend API with 14 endpoints
- PostgreSQL database schema (20+ tables)
- Seeded demo content (founders, companies, events, programs, partners, sponsors, news)
- Design system: Navy/Gold/Cream palette, shadcn/ui components
- Member dashboard shell
- Admin dashboard shell

### Backend
- See [backend/CHANGELOG.md](./backend/CHANGELOG.md) for Laravel framework changelog
