# Decisions

## Decision Register

This file records high-level decisions that shape the repository and product direction. Detailed ADRs should be added in `docs/ADR/` as decisions become more consequential and implementation-specific.

| ID | Decision | Status | Rationale |
|---|---|---|---|
| D-001 | Operate as a monorepo | Accepted | Simplifies cross-functional coordination across product, docs, and delivery |
| D-002 | Use Next.js for frontend and Laravel for backend | Accepted | Balances UI velocity with structured backend domain modeling |
| D-003 | Treat docs and SKILLS as part of the repository operating system | Accepted | Preserves execution context and improves repeatability |
| D-004 | Prioritize Saudi Arabia before GCC expansion | Accepted | Improves product-market focus and regional credibility |
| D-005 | Sequence delivery foundations before major feature rollout | Accepted | Reduces downstream implementation risk |

---

## Current Decision Pressure

The next decisions that need formal ADRs are deployment topology, authentication strategy, Arabic/RTL implementation approach, and observability tooling.
