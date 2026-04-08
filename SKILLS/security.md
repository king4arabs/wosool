# Security Skills

> Authentication, authorization, data protection, vulnerability management

---

## Current Posture

| Area | Status |
|------|--------|
| Authentication | 🟡 Sanctum installed, not implemented |
| Authorization | 🟡 Spatie Permission installed, not active |
| Input validation | 🟡 Partial (inline in controllers) |
| CORS | ✅ Configured |
| CSRF | ✅ Active (web routes) |
| SQL injection | ✅ Protected (Eloquent ORM) |
| XSS | ✅ Protected (React + Blade escaping) |
| Rate limiting | ❌ Not configured |
| Secrets management | 🟡 .env files |
| Dependency scanning | ❌ Not automated |
| Security headers | ❌ Not configured |

---

## Authentication

### Stack
- **Laravel Sanctum** — API token authentication
- **bcrypt** — Password hashing (Laravel default)

### Implementation Checklist
- [ ] Login endpoint (`POST /api/v1/auth/login`)
- [ ] Register endpoint (`POST /api/v1/auth/register`)
- [ ] Logout endpoint (`POST /api/v1/auth/logout`)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Token refresh mechanism
- [ ] Session management
- [ ] Account lockout after failed attempts

---

## Authorization (RBAC)

### Roles
| Role | Access |
|------|--------|
| founder | Own profile, community, programs |
| partner | Partner portal, founder directory |
| sponsor | Sponsor portal, analytics |
| admin | Full platform management |
| super_admin | System configuration |

### Implementation
- Spatie Permission package for role/permission management
- Middleware-based route protection
- Policy classes for model-level authorization

---

## Input Validation

### Standards
- Use Laravel Form Requests (not inline validation)
- Validate all user input server-side
- Sanitize HTML content
- Validate file uploads (type, size)

### Common Rules
```php
'email' => 'required|email|unique:users'
'name' => 'required|string|max:255'
'slug' => 'required|string|alpha_dash|unique:table'
'url' => 'nullable|url'
'phone' => 'nullable|regex:/^[\+]?[0-9\s\-\(\)]+$/'
```

---

## API Security

| Protection | Method |
|-----------|--------|
| Rate limiting | Laravel throttle middleware (60/min public, 120/min auth) |
| CORS | Allowed origins whitelist |
| Input size | Request size limit (10MB default) |
| SQL injection | Parameterized queries (Eloquent) |
| Mass assignment | $fillable/$guarded on models |
| Token auth | Sanctum bearer tokens |

---

## Data Protection (PDPL)

Saudi Personal Data Protection Law considerations:

- [ ] Privacy policy (Arabic + English)
- [ ] Terms of service (Arabic + English)
- [ ] User consent mechanism
- [ ] Data access request handling
- [ ] Data deletion capability
- [ ] Data breach notification process
- [ ] Data residency (Saudi-region hosting)

---

## Security Headers

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Dependency Management

| Check | Tool | Frequency |
|-------|------|-----------|
| npm audit | npm | Every CI run |
| composer audit | Composer | Every CI run |
| Dependabot | GitHub | Continuous |
| CodeQL | GitHub | On PR |

---

## Incident Response

1. **Detect** — Monitoring alerts (Sentry, UptimeRobot)
2. **Contain** — Isolate affected service
3. **Assess** — Determine scope and impact
4. **Fix** — Deploy patch
5. **Notify** — Inform users (per PDPL if data breach)
6. **Review** — Post-mortem and prevention
