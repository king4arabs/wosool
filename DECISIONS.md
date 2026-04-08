# Decisions

> Architectural Decision Records (ADRs) for Wosool.

---

## ADR-001: Monorepo Structure

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Need to organize frontend and backend code for a full-stack platform.

**Decision:** Use a monorepo with `frontend/` and `backend/` directories in a single repository.

**Rationale:**
- Simpler code review and change tracking
- Shared documentation and CI/CD
- Easier onboarding for new contributors
- Atomic commits across frontend and backend

**Consequences:**
- Need clear separation of concerns between directories
- CI/CD must handle both build targets
- Dependency management is per-directory (npm + composer)

---

## ADR-002: Next.js for Frontend

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Need a modern React framework for the founder platform frontend.

**Decision:** Use Next.js 16 with App Router, TypeScript, and Tailwind CSS 4.

**Rationale:**
- Server-side rendering for SEO (important for content pages)
- App Router for modern React patterns
- TypeScript for type safety at scale
- Tailwind CSS 4 with CSS-based configuration for maintainability
- Strong ecosystem and community support
- Easy deployment to Vercel

**Consequences:**
- Team must learn App Router patterns
- CSS-based Tailwind config (not JS config file)
- Need to manage server/client component boundaries

---

## ADR-003: Laravel for Backend

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Need a robust backend framework for REST API and business logic.

**Decision:** Use Laravel 13 with PHP 8.3 for the backend API.

**Rationale:**
- Mature ecosystem with excellent ORM (Eloquent)
- Built-in authentication (Sanctum) and authorization (Spatie)
- Strong database migration system
- Queue and job processing (for async tasks)
- Large developer community
- PHP readily available in Saudi/GCC talent market

**Consequences:**
- Separate runtime from frontend (Node.js vs PHP)
- Need PHP hosting (Railway, Forge, etc.)
- API-only backend (no server-side views for main app)

---

## ADR-004: PostgreSQL as Primary Database

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Need a reliable, scalable database for platform data.

**Decision:** Use PostgreSQL with pgvector extension for AI features.

**Rationale:**
- Robust ACID compliance and data integrity
- pgvector enables AI/ML embedding storage
- Excellent JSON support for flexible schemas
- Strong ecosystem (Supabase, AWS RDS, Railway)
- Superior to MySQL for complex queries and full-text search

**Consequences:**
- Need pgvector extension for AI features
- Hosting options slightly more limited than MySQL
- Team must know PostgreSQL-specific features

---

## ADR-005: shadcn/ui Component Library

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Need a consistent, accessible component library.

**Decision:** Use shadcn/ui with Radix UI primitives and CVA for variant management.

**Rationale:**
- Copy-paste components (own the code, not a dependency)
- Built on accessible Radix UI primitives
- Tailwind CSS integration
- Highly customizable for brand theming
- Active community and regular updates

**Consequences:**
- Components live in `src/components/ui/`
- Must maintain component code directly
- Use `cn()` utility for class merging

---

## ADR-006: Tailwind CSS v4 with CSS Config

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Tailwind CSS v4 introduced CSS-based configuration.

**Decision:** Use Tailwind CSS v4 with `@theme` directive in `globals.css` instead of `tailwind.config.ts`.

**Rationale:**
- Native CSS approach is more maintainable
- No JavaScript config file needed
- Better IDE support with CSS syntax
- Follows Tailwind v4 best practices

**Consequences:**
- No `tailwind.config.ts` file in the project
- Theme customization via `@theme` in `globals.css`
- Must use system fonts (no Google Fonts in build environment)

---

## ADR-007: API-First Architecture

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Frontend and backend are separate applications.

**Decision:** Build as an API-first platform with REST endpoints consumed by the Next.js frontend.

**Rationale:**
- Clean separation of concerns
- Frontend can be deployed independently
- API can serve future mobile apps
- Enables third-party integrations
- Better scalability

**Consequences:**
- Need CORS configuration
- Authentication via API tokens (Sanctum)
- API versioning required (`/api/v1`)
- Must maintain API documentation

---

## ADR-008: Documentation as Code

**Date:** 2026-04-08
**Status:** Accepted

**Context:** Need comprehensive documentation for the project.

**Decision:** Maintain all documentation as Markdown files in the repository root and SKILLS/ directory.

**Rationale:**
- Version-controlled alongside code
- Easy to review in PRs
- Accessible without external tools
- SKILLS/ framework provides structured knowledge base
- Encourages documentation-driven development

**Consequences:**
- Must update docs with code changes
- Documentation lives in repository (not wiki or external tool)
- SKILLS/ files serve as onboarding and reference material

---

## Template for New Decisions

```markdown
## ADR-XXX: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded

**Context:** What is the issue?

**Decision:** What was decided?

**Rationale:** Why this choice?

**Consequences:** What are the trade-offs?
```
