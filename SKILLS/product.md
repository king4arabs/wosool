# Product Skills

> Features, UX, user experience, product roadmap

---

## Product Overview

**Wosool** is a founders-to-founders network and execution platform for the Saudi/GCC startup ecosystem.

### Core User Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| Early-stage founder | Pre-seed / seed, building MVP | Mentorship, connections, validation |
| Growth-stage founder | Series A+, scaling | Talent, partnerships, expansion |
| Partner (VC/accelerator) | Ecosystem player | Deal flow, founder access |
| Sponsor (corporate) | Corporate supporter | Brand visibility, innovation access |
| Admin | Platform operator | User management, content, analytics |

---

## Feature Map

### Phase 1 (Complete ✅)

| Feature | Pages | Status |
|---------|-------|--------|
| Homepage | `/` | ✅ Built |
| About | `/about` | ✅ Built |
| Founder directory | `/founders` | ✅ Built |
| Company directory | `/founders/companies` | ✅ Built |
| Programs | `/programs` | ✅ Built |
| Events | `/events` | ✅ Built |
| Partners | `/partners` | ✅ Built |
| Sponsors | `/sponsors` | ✅ Built |
| News | `/news` | ✅ Built |
| Apply | `/apply` | ✅ Built |
| Contact | `/contact` | ✅ Built |
| Login | `/login` | ✅ Built (UI only) |
| Dashboard | `/dashboard` | ✅ Shell |
| Admin | `/admin` | ✅ Shell |

### Phase 2 (Next)

| Feature | Priority | Status |
|---------|----------|--------|
| Authentication flow | Critical | 🔴 Not started |
| Profile management | High | 🔴 Not started |
| API integration | High | 🔴 Not started |
| Community feed | Medium | 🔴 Not started |
| Matching system | Medium | 🔴 Not started |
| Event RSVP | Medium | 🔴 Not started |

### Phase 3 (Future)

| Feature | Priority |
|---------|----------|
| AI scorecard | High |
| Smart matching | Medium |
| In-app messaging | Medium |
| CMS for admins | Medium |
| Email notifications | Medium |
| Analytics dashboard | Low |

---

## UX Principles

1. **Trust first** — Premium, professional aesthetic that builds credibility
2. **Arabic-aware** — Design for bilingual, RTL-ready layouts
3. **Mobile-first** — Responsive design for all screen sizes
4. **Action-oriented** — Clear CTAs, minimal friction to key actions
5. **Data-driven** — Show meaningful metrics and progress indicators

---

## Design System

| Element | Value |
|---------|-------|
| Primary (Navy) | `#0A1628` |
| Accent (Gold) | `#C9A84C` |
| Background (Cream) | `#F8F5EF` |
| Font | System font stack |
| Components | shadcn/ui (Radix primitives) |
| Icons | Lucide React |

---

## User Flows

### Apply to Join
```
Homepage → Apply page → Fill application → Submit → Confirmation
                                                    ↓
                                              Admin review → Approve/Reject → Email notification
```

### Founder Onboarding (Planned)
```
Application approved → Welcome email → Create account → Complete profile → Dashboard
```

### Matching (Planned)
```
Dashboard → View suggestions → Send intro request → Counterparty accepts → Connected
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first connection | < 7 days | From signup to first intro |
| Application completion rate | > 70% | Started / submitted |
| Monthly active founders | > 40% of total | DAU/MAU ratio |
| NPS | > 50 | Quarterly survey |
| Event attendance rate | > 60% | RSVP / attended |

---

## Competitive Differentiation

| Feature | Wosool | Competitors |
|---------|--------|-------------|
| Saudi/GCC focus | ✅ Primary | ❌ Global or Western |
| AI-powered matching | ✅ Planned | 🟡 Limited |
| Founder scorecard | ✅ Planned | ❌ Not offered |
| Bilingual AR/EN | ✅ Planned | ❌ English only |
| Application-based | ✅ Curated | 🟡 Varies |
| Execution support | ✅ Intros + programs | 🟡 Events only |
