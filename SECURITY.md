# Security

> Wosool security policies, practices, and compliance.

---

## Security Posture

| Area | Status | Notes |
|------|--------|-------|
| Authentication | 🟡 Configured | Sanctum installed, not implemented |
| Authorization | 🟡 Configured | Spatie Permission installed, not implemented |
| Input validation | 🟡 Partial | Some controller validation, needs Form Requests |
| CORS | ✅ Configured | Laravel CORS middleware |
| CSRF | ✅ Active | Laravel built-in (web routes) |
| SQL injection | ✅ Protected | Eloquent ORM parameterized queries |
| XSS | ✅ Protected | React auto-escaping + Blade escaping |
| Rate limiting | ❌ Not configured | Needs implementation |
| Secrets management | 🟡 Basic | .env files, needs vault/CI secrets |
| Dependency scanning | ❌ Not configured | Needs automated CVE scanning |
| SSL/TLS | ✅ Cloudflare | Full Strict mode |

---

## Authentication Strategy

### Current
- Laravel Sanctum installed (v4.3)
- Token-based API authentication
- Not yet implemented in controllers/routes

### Planned
- Email/password registration and login
- Email verification
- Password reset flow
- Session management with secure cookies
- API token scoping

---

## Authorization Model

### Roles (via Spatie Permission)

| Role | Access Level |
|------|-------------|
| founder | Profile, dashboard, community features |
| partner | Partner portal, founder directory |
| sponsor | Sponsor portal, analytics |
| admin | Full platform access, CMS, user management |
| super_admin | System configuration, role management |

### Permission Groups

| Group | Permissions |
|-------|------------|
| Profile | create, read, update, delete own profile |
| Community | view feed, create posts, send intros |
| Events | view, RSVP, manage (admin) |
| Programs | view, apply, manage (admin) |
| Applications | submit, review (admin), score (admin) |
| Admin | manage users, content, analytics |

---

## Data Protection

### Saudi PDPL Compliance (Planned)

| Requirement | Status |
|-------------|--------|
| Data residency in Saudi Arabia | ⬜ Planned (Saudi-region hosting) |
| User consent for data collection | ⬜ Planned |
| Right to access personal data | ⬜ Planned |
| Right to data deletion | ⬜ Planned |
| Data breach notification | ⬜ Planned |
| Privacy policy (AR/EN) | ⬜ Planned |
| Data Processing Agreement | ⬜ Planned |

### Data Classification

| Classification | Examples | Handling |
|---------------|----------|----------|
| Public | Events, news, programs | No restrictions |
| Internal | Founder profiles (published) | Visible to members |
| Confidential | Applications, scorecards | Restricted access |
| Secret | Passwords, API keys, tokens | Encrypted, never logged |

---

## API Security

### Current Protections
- CORS middleware with allowed origins
- CSRF protection on web routes
- JSON response format enforcement

### Planned Protections
- Rate limiting (60 requests/min for public, 120 for authenticated)
- Request throttling per IP and per user
- API token scoping and expiration
- Request size limits
- Input sanitization middleware

---

## Infrastructure Security

| Layer | Measure | Status |
|-------|---------|--------|
| DNS | Cloudflare proxy (DDoS protection) | ✅ Active |
| SSL | Full Strict mode | ✅ Active |
| WAF | Cloudflare WAF rules | 🟡 Basic |
| Headers | Security headers (CSP, HSTS, X-Frame) | ⬜ Planned |
| Secrets | Environment variables (.env) | ✅ Active |
| Secrets | CI/CD secrets management | ⬜ Planned |
| Backups | Database backup schedule | ⬜ Planned |

---

## Dependency Security

### Frontend (npm)
- `npm audit` — 0 known vulnerabilities (last checked: v0.2.0)
- Dependencies: Next.js 16.2.2, React 19.2.4, TypeScript 5

### Backend (Composer)
- `composer audit` — run periodically
- Dependencies: Laravel 13.0, Sanctum 4.3, Spatie Permission 7.2

### Recommended Scanning
- Enable GitHub Dependabot alerts
- Add `npm audit` and `composer audit` to CI pipeline
- Use Snyk or Socket.dev for supply chain monitoring

---

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P0 | Data breach, service down | Immediate |
| P1 | Security vulnerability, major bug | < 4 hours |
| P2 | Performance degradation | < 24 hours |
| P3 | Minor issue, cosmetic | < 1 week |

### Response Checklist

1. Identify and contain the issue
2. Assess impact and affected data
3. Notify stakeholders (per PDPL if applicable)
4. Fix and deploy patch
5. Post-mortem and prevention measures
6. Update documentation and runbooks

---

## Security Checklist (Pre-Launch)

- [ ] Implement authentication flows
- [ ] Implement role-based access control
- [ ] Add rate limiting to all API endpoints
- [ ] Configure security headers (CSP, HSTS, X-Frame-Options)
- [ ] Enable Dependabot alerts
- [ ] Set up automated dependency scanning in CI
- [ ] Create privacy policy (AR/EN)
- [ ] Create terms of service (AR/EN)
- [ ] Configure database backups
- [ ] Set up error monitoring (Sentry)
- [ ] Conduct penetration testing
- [ ] Review PDPL compliance requirements
