# Architecture Decision Records

## Purpose

This directory tracks **important architectural and product implementation decisions** that should remain discoverable after code and team context evolve. ADRs preserve reasoning, expose trade-offs, and reduce repeated debate.

---

## When to Add an ADR

| Add an ADR when deciding... | Example |
|---|---|
| Runtime or framework direction | Next.js and Laravel split versus consolidation |
| Infrastructure pattern | Edge frontend plus managed backend versus container stack |
| Authentication strategy | Sanctum versus third-party identity provider |
| Market-critical implementation | Arabic-first routing, RTL strategy, or Saudi data residency stance |
| Observability platform | Sentry versus Datadog versus lighter monitoring stack |

---

## Suggested Template

```md
# ADR-0001: Decision Title

## Status
Accepted

## Context
What problem are we solving?

## Decision
What did we decide?

## Consequences
What becomes easier, harder, or constrained because of this decision?
```

---

## Current Priority ADRs

| Candidate ADR | Reason |
|---|---|
| Deployment topology | Needed before production hosting is finalized |
| Authentication architecture | Needed before member onboarding is built |
| Public-to-private data boundary | Needed before dashboard live integration |
| Arabic and RTL strategy | Needed before localization rollout |
| Observability stack | Needed before pre-launch testing expands |

The `DECISIONS.md` file remains the human-readable decision register, while this directory provides the durable structure for full decision records.
