# TODO

> Prioritized backlog for the current Wosool enhancement loop.

---

## Critical

- [ ] Add email verification flow for new user registrations.
- [ ] Replace seed data on remaining public pages with live API integration.
- [ ] Add monitoring and analytics instrumentation.
- [ ] Add security headers and environment hardening (CSP).

---

## High Priority

- [ ] Add frontend integration tests for API-backed pages.
- [ ] Add OpenAPI specification for the public API.
- [ ] Add Arabic language support and RTL layout primitives.
- [ ] Add email delivery provider for applications and contact flows.
- [ ] Introduce staging environment configuration and deployment preview discipline.

---

## Medium Priority

- [ ] Founder profile CRUD.
- [ ] Company profile CRUD.
- [ ] Event RSVP workflow.
- [ ] Program application workflow.
- [ ] Partner and sponsor content management.
- [ ] Admin analytics dashboard backed by real tracking.

---

## Completed in `0.4.0`

- [x] Implemented authentication flow with Laravel Sanctum SPA sessions.
- [x] Introduced role-based access control with Spatie permissions (admin, member).
- [x] Created login, register, logout, and profile endpoints.
- [x] Added frontend AuthProvider context with session management.
- [x] Added Next.js middleware to protect dashboard and admin routes.
- [x] Connected founders, events, and programs pages to live backend API.
- [x] Created register page with form validation.
- [x] Made navigation and dashboard auth-aware.
- [x] Added 8 auth endpoint tests.

## Completed in `0.3.1`

- [x] Functional Apply form with multi-step validation, API submission, and success state.
- [x] Functional Contact form with validation, API submission, and success state.
- [x] Terms of Service page.
- [x] Privacy Policy page.
- [x] Forgot Password page.
- [x] Fixed broken internal links.

## Completed in `0.3.0`

- [x] Added repository-level CI/CD workflow.
- [x] Added backend API feature-test foundation.
- [x] Added API and SDK documentation.
- [x] Added ADR index and editor configuration.
- [x] Cleaned avoidable frontend lint warnings.
- [x] Upgraded repository operating-system documentation for the current release.
