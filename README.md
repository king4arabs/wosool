# Wosool

> A premium founders-to-founders network and execution platform designed for **Saudi Arabia first**, with deliberate expansion across the GCC, MENA, and global founder ecosystem.

**Domain:** [wosool.org](https://wosool.org) | **Version:** `0.5.0` | **Stage:** Pre-launch MVP hardening

---

## Overview

**Wosool (وصول)** helps founders build faster through trusted community, curated introductions, events, programs, and operational support. The repository is organized as a monorepo with a **Next.js frontend**, a **Laravel backend**, and a growing repository operating system composed of documentation, SKILLS files, release metadata, and implementation standards.

This release focuses on **delivery readiness** rather than feature sprawl. The highest-value work at this stage is to strengthen testing, CI/CD, documentation quality, security posture, and engineering consistency so that later product work—especially authentication, profile CRUD, live API integration, analytics, and localization—can be implemented with lower risk.

| Layer | Current implementation |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| Backend | Laravel 13, Form Requests, REST-style public API |
| Database | PostgreSQL-first schema design with SQLite-compatible testing path |
| Product positioning | Saudi-first founder network with GCC expansion readiness |
| Repository OS | Structured docs, SKILLS framework, changelog, version tracking, ADR index |

---

## Repository Structure

```text
wosool/
├── frontend/              # Next.js application
├── backend/               # Laravel API and data layer
├── docs/                  # API, SDK, audits, runbooks, ADR index
├── SKILLS/                # Cross-functional execution guides
├── scripts/               # Utility scripts and operational helpers
├── README.md              # Primary project entry point
└── core docs              # Status, roadmap, architecture, security, testing, ops
```

The repository is intended to function as both a **product codebase** and a **delivery system**. Documentation and SKILLS files are maintained as operational assets, not passive reference material.

---

## Current Product Surface

| Capability area | Status |
|---|---|
| Public marketing pages | Implemented |
| Member dashboard shells | Implemented |
| Admin portal shells | Implemented |
| Public read API | Implemented |
| Public application and contact submissions | Implemented |
| Public write-endpoint throttling | Implemented |
| CI/CD workflows | Introduced in `0.3.0` |
| Backend API test foundation | Introduced in `0.3.0` |
| Authentication and RBAC | Implemented |
| Member profile/company CRUD | Implemented |
| Event RSVP and program applications | Implemented |
| Frontend live API adoption | Partial, remaining dashboard/admin pages still being wired |
| Arabic/English localization and RTL | Planned next |

---

## Local Development

### Full Platform Bootstrap

From the repository root, you can install and verify the entire platform with:

```bash
npm run setup
npm run verify
```

`npm run setup` installs frontend and backend dependencies, prepares the default SQLite database, generates the Laravel app key, and runs backend migrations so the repository is ready to boot locally.
`npm run setup` installs frontend and backend dependencies, copies the backend environment file if needed, generates the Laravel app key, and runs backend migrations against your local MySQL database.

To run the two application surfaces locally, use separate terminals from the repository root:

```bash
npm run dev:backend
npm run dev:frontend
```

### Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

### Backend

```bash
cd backend
composer install
npm install
cp .env.example .env
php artisan key:generate
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS wosool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate
php artisan db:seed
composer run dev
```

### Seeded Accounts

After `php artisan db:seed`, you can sign in with:

```text
Admin  : admin@wosool.org / wosool2024!
Member : sara@example.com / demo123!
Member : khalid@example.com / demo123!
Member : nora@example.com / demo123!
Member : ahmed@example.com / demo123!
Member : lina@example.com / demo123!
Member : omar@example.com / demo123!
```

When working in a constrained environment, keep the documented runtime in sync with [DEPLOYMENT.md](./DEPLOYMENT.md) and treat CI as the authoritative validation layer.

---

## Engineering and Delivery Standards

| Standard | Expectation |
|---|---|
| Versioning | Semantic Versioning across releases |
| Release metadata | Every release updates `CHANGELOG.md` and `VERSION.md` |
| Quality gate | Frontend lint/build and backend tests should pass in CI |
| Security baseline | Rate limiting, secret hygiene, dependency review, documented controls |
| Product clarity | Core operating docs remain current and decision-oriented |
| Regional readiness | Saudi-first assumptions, bilingual planning, RTL readiness |

---

## Core Documentation

| Document | Purpose |
|---|---|
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Current product and delivery posture |
| [ROADMAP.md](./ROADMAP.md) | Sequenced implementation priorities |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, boundaries, and patterns |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Runtime and deployment guidance |
| [TESTING.md](./TESTING.md) | Validation strategy and quality gates |
| [SECURITY.md](./SECURITY.md) | Security baseline and next controls |
| [OPERATIONS.md](./OPERATIONS.md) | Operating procedures and release discipline |
| [BUSINESS_CONTEXT.md](./BUSINESS_CONTEXT.md) | Market and business framing |
| [MARKETING_GROWTH.md](./MARKETING_GROWTH.md) | Growth motion and channel strategy |
| [DECISIONS.md](./DECISIONS.md) | Decision register |
| [TODO.md](./TODO.md) | Prioritized backlog |
| [docs/API.md](./docs/API.md) | API contract overview |
| [docs/SDK.md](./docs/SDK.md) | Client integration guidance |
| [docs/ADR/README.md](./docs/ADR/README.md) | ADR index and usage guidance |
| [SKILLS/README.md](./SKILLS/README.md) | Repository execution skill system |

---

## Immediate Release Focus: `0.5.0`

The `0.5.0` release moves Wosool from authenticated prototype to a more realistic member product. The focus is on shipping real founder workflows while keeping the repository reliable enough for the next launch-readiness phase.

| Priority | Why it matters |
|---|---|
| Member founder profile CRUD | Lets authenticated members manage their profile in-product |
| Member company CRUD | Lets members manage company data with ownership enforcement |
| Event RSVP flow | Enables real engagement and capacity-aware waitlisting |
| Program application flow | Enables real member applications with deadline and duplicate guards |
| Test coverage growth | Keeps the expanding member API safe to iterate on |

---

## Product Principles

Wosool should evolve as an **enterprise-quality**, **regionally aware**, and **trust-centered** platform. Improvements should preserve existing work, build iteratively, document rationale clearly, and always optimize for Saudi Arabia first before expanding to wider regional and global contexts.
