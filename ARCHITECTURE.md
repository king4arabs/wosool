# Architecture

## System Overview

Wosool is structured as a **monorepo** with a presentation layer in **Next.js** and a service/data layer in **Laravel**. This separation supports fast frontend iteration, structured backend domain modeling, and clean operational boundaries for future scaling.

| Layer | Responsibility |
|---|---|
| Frontend | Public website, dashboard shells, admin shells, presentation logic |
| Backend | Public API, validation, domain modeling, persistence, future auth |
| Database | Founders, companies, programs, events, submissions, analytics-ready entities |
| Repository OS | Docs, SKILLS, decisions, release metadata, CI/CD discipline |

---

## Current Architectural Posture

The frontend is currently ahead of the backend in product surface breadth, while the backend is ahead in data structure and domain organization. The next architectural objective is to **close the gap** by moving selected public experiences from static seed data to real API consumption.

---

## Architectural Principles

| Principle | Meaning |
|---|---|
| Preserve existing work | Improve rather than replace valuable implementation |
| Clear boundaries | Keep UI concerns out of backend domain logic |
| Contract-first iteration | Let public API behavior guide frontend integration |
| Saudi-first readiness | Design with bilingual, RTL, regional compliance, and trust in mind |
| Delivery before scale | Strengthen quality gates before expanding feature count |

---

## Frontend Architecture

The frontend uses the App Router and a component-driven structure. Shared UI primitives and layout components should remain reusable, while data access should increasingly move behind `frontend/src/lib/api.ts` instead of direct dependency on `seed.ts`.

---

## Backend Architecture

The backend follows a conventional Laravel structure with controllers, models, Form Requests, migrations, and seeders. Public read endpoints expose the discovery layer, while public write endpoints support applications and contact flows. Authentication, policies, and role-based behavior remain next-phase responsibilities.

---

## Target Next Step

The most important near-term architecture change is a **hybrid integration phase**: selected frontend pages should consume typed backend data through a centralized API layer while fallback content remains available only where necessary during migration.
