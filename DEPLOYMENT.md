# Deployment

## Deployment Strategy

Wosool should be deployed as a **two-surface application**: a frontend optimized for fast edge delivery and a backend optimized for secure API execution, persistence, and operational control.

| Surface | Recommended default |
|---|---|
| Frontend | Vercel or equivalent edge-oriented platform |
| Backend | Managed PHP-capable platform or container runtime |
| Database | Managed PostgreSQL with secure backups |
| Cache/queue | Redis when async and background workloads are activated |

---

## Runtime Baseline

| Component | Recommended runtime |
|---|---|
| Node.js | 22.x |
| PHP | 8.3 |
| Database | PostgreSQL 16+ |
| Queue/cache | Redis 7+ |

---

## Environment Model

| Environment | Purpose |
|---|---|
| Local | Feature implementation and debugging |
| Preview | Pull request and stakeholder review |
| Staging | Production-like validation |
| Production | Live founder-facing service |

---

## Pre-Production Checklist

| Check | Requirement |
|---|---|
| CI passes | Required |
| Environment variables documented | Required |
| Database migration strategy reviewed | Required |
| Rollback approach defined | Required |
| Security headers and domain config reviewed | Required |
| Monitoring hooks prepared | Required before launch |

---

## Saudi-First Deployment Notes

Production hosting decisions should consider data residency sensitivity, enterprise procurement expectations, Arabic content support, and regional performance across Saudi Arabia and the GCC.
