# TODO

> Prioritized task backlog for Wosool. Ordered by impact and urgency.

---

## 🔴 Critical (Do Next)

- [ ] **Set up CI/CD pipeline** — GitHub Actions for lint, test, build on push/PR
- [ ] **Implement authentication** — Login, register, email verification with Sanctum
- [ ] **Add backend tests** — PHPUnit feature tests for all API endpoints
- [ ] **Connect frontend to API** — Replace mock seed.ts data with real API calls
- [ ] **Add rate limiting** — Protect API endpoints from abuse

---

## 🟡 High Priority

- [ ] **Implement RBAC** — Activate Spatie permissions for founder/partner/admin roles
- [ ] **Add Form Requests** — Laravel validation classes for all POST endpoints
- [ ] **Frontend testing setup** — Vitest + React Testing Library configuration
- [ ] **Error monitoring** — Integrate Sentry for frontend and backend
- [ ] **Environment configuration** — Staging environment setup
- [ ] **Security headers** — Add CSP, HSTS, X-Frame-Options
- [ ] **API documentation** — OpenAPI/Swagger spec for all endpoints

---

## 🟢 Medium Priority

- [ ] **Founder profile CRUD** — Create, read, update, delete profiles
- [ ] **Company profile CRUD** — Full company management
- [ ] **Community feed** — Posts, updates, milestones
- [ ] **Match suggestions** — Founder-to-founder matching algorithm
- [ ] **Warm intros** — Introduction request workflow
- [ ] **Event RSVP** — Event registration and attendance
- [ ] **Program applications** — Application submission and review
- [ ] **Email notifications** — Transactional emails (Resend or SendGrid)
- [ ] **Analytics integration** — PostHog or Plausible setup
- [ ] **Database backups** — Automated pg_dump to S3

---

## 🔵 Future / Nice to Have

- [ ] **Arabic language support** — i18n with RTL layout
- [ ] **AI scorecard engine** — Founder scoring algorithm
- [ ] **AI matching** — Smart founder pairing with embeddings
- [ ] **Admin CMS** — Content management for news, events
- [ ] **Appointment booking** — Calendar integration
- [ ] **In-app messaging** — Real-time chat
- [ ] **Push notifications** — Browser and mobile
- [ ] **Payment integration** — Moyasar (SAR) + Stripe
- [ ] **Mobile app** — React Native or PWA
- [ ] **Kubernetes deployment** — Container orchestration
- [ ] **Full observability** — Datadog or New Relic stack

---

## ✅ Completed

- [x] Repository structure (monorepo)
- [x] Frontend pages (17 routes)
- [x] Backend API (14 endpoints)
- [x] Database schema (20+ tables)
- [x] Design system (Navy/Gold/Cream)
- [x] Component library (shadcn/ui)
- [x] Demo seed data
- [x] Documentation framework (v0.2.0)
- [x] SKILLS reference files

---

## Contributing

When picking up a task:
1. Move it from the appropriate priority section
2. Create a branch: `feature/task-name` or `fix/task-name`
3. Implement with tests
4. Submit PR with changelog entry
5. Mark as completed when merged
