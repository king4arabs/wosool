# Roadmap

> Wosool development roadmap — Saudi Arabia first, then GCC, MENA, and global.

---

## Phase 1 — Foundation ✅ Complete

> Shipped: v0.1.0

- [x] Monorepo structure (frontend/ + backend/)
- [x] Next.js 16 frontend with 17 routes
- [x] Design system (Navy/Gold/Cream, shadcn/ui)
- [x] Laravel 13 backend with REST API
- [x] PostgreSQL schema (15 migrations, 20+ tables)
- [x] Seeded demo content
- [x] Member and admin dashboard shells
- [x] Repository operations system and documentation (v0.2.0)

---

## Phase 2 — Core Platform 🟡 In Progress

> Target: v0.3.0–0.5.0

### Authentication & Identity
- [ ] Laravel Sanctum token-based auth
- [ ] Login / register / email verification flows
- [ ] Role-based access (founder, partner, sponsor, admin)
- [ ] Password reset and account recovery

### Profile & Data Management
- [ ] Founder profile CRUD
- [ ] Company profile CRUD
- [ ] Profile image upload (Supabase Storage or S3)
- [ ] Frontend ↔ Backend API integration (replace mock data)

### Community Features
- [ ] Community feed (posts, updates, milestones)
- [ ] Founder directory with search and filters
- [ ] Match suggestions (founder-to-founder, founder-to-mentor)
- [ ] Warm introduction requests
- [ ] Appointment booking system

### Programs & Events
- [ ] Event RSVP and attendance tracking
- [ ] Program application workflow
- [ ] Cohort management

### Infrastructure
- [ ] CI/CD with GitHub Actions (lint, test, build, deploy)
- [ ] Unit and feature tests (PHPUnit + Jest/Vitest)
- [ ] Environment configuration for staging/production
- [ ] Error tracking (Sentry)
- [ ] Rate limiting and API throttling

---

## Phase 3 — Intelligence & Scale

> Target: v0.6.0–1.0.0

### AI Service Layer
- [ ] AI agent architecture (10 agents planned)
- [ ] Founder scorecard calculation engine
- [ ] AI-powered match scoring
- [ ] Content generation assistance
- [ ] Smart notifications and recommendations

### Analytics & Insights
- [ ] Analytics dashboard (PostHog or Plausible)
- [ ] Founder engagement metrics
- [ ] Program effectiveness tracking
- [ ] Admin reporting and exports

### Content & Communications
- [ ] Admin CMS for news, events, programs
- [ ] Email notification system (Resend or SendGrid)
- [ ] In-app messaging
- [ ] Push notifications

### Internationalization
- [ ] Arabic language support (i18n)
- [ ] RTL layout support
- [ ] Date/currency localization (SAR, AED)

---

## Phase 4 — Enterprise & Growth

> Target: v1.0.0+

### Enterprise Features
- [ ] Multi-tenant organization support
- [ ] Advanced analytics and BI dashboards
- [ ] API for third-party integrations
- [ ] Webhook system for external automations
- [ ] SSO (SAML/OIDC) for enterprise partners

### Regional Expansion
- [ ] GCC country-specific features (UAE, Bahrain, Kuwait, Oman, Qatar)
- [ ] MENA expansion support
- [ ] Multi-currency payment processing (Moyasar, Stripe)
- [ ] Regional compliance (Saudi data residency, PDPL)

### Growth & Monetization
- [ ] Premium membership tiers
- [ ] Sponsor/partner portal
- [ ] Event ticketing
- [ ] Marketplace for founder services
- [ ] Affiliate/referral program

### Infrastructure at Scale
- [ ] Kubernetes deployment
- [ ] CDN optimization (Cloudflare)
- [ ] Database read replicas
- [ ] Queue workers (Redis/Horizon)
- [ ] Full observability stack (Datadog or New Relic)

---

## Milestones

| Milestone | Version | Target | Status |
|-----------|---------|--------|--------|
| Platform foundation | 0.1.0 | Q1 2026 | ✅ Done |
| Docs & operations system | 0.2.0 | Q2 2026 | ✅ Done |
| Auth & profiles | 0.3.0 | Q2 2026 | 🟡 Next |
| Community MVP | 0.4.0 | Q2 2026 | ⬜ Planned |
| Programs & events | 0.5.0 | Q3 2026 | ⬜ Planned |
| AI layer | 0.6.0 | Q3 2026 | ⬜ Planned |
| Public beta | 0.8.0 | Q4 2026 | ⬜ Planned |
| Production launch | 1.0.0 | Q1 2027 | ⬜ Planned |
