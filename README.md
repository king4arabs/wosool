# Wosool — Founders to Founders

> A premium, curated founder network and execution platform for the Saudi and GCC startup ecosystem.

**Domain:** [wosool.org](https://wosool.org) | **Social:** @AboutWosool

---

## Overview

Wosool is a founders-to-founders platform that helps founders connect, grow, collaborate, and access trusted support through community, programs, introductions, events, and AI-powered workflows.

### Core Promise
> *Founders helping founders build faster.*

---

## Architecture

```
wosool/
├── frontend/          # Next.js 15 + TypeScript + Tailwind CSS
├── backend/           # Laravel 12 PHP API
└── README.md
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui components |
| Backend | Laravel 12, PHP 8.3, RESTful API |
| Database | PostgreSQL (+ pgvector for AI features) |
| Cache/Queue | Redis |
| Auth | Laravel Sanctum |

---

## Frontend

### Setup

```bash
cd frontend
npm install
npm run dev        # Development server at http://localhost:3000
npm run build      # Production build
npm run lint       # Lint check
```

### Public Pages (17 routes)

| Path | Description |
|------|-------------|
| `/` | Homepage with all sections |
| `/about` | About Wosool |
| `/founders` | Founder directory |
| `/founders/companies` | Companies directory |
| `/programs` | Programs and cohorts |
| `/events` | Events calendar |
| `/partners` | Partners and supporters |
| `/sponsors` | Sponsorship information |
| `/news` | News and updates |
| `/apply` | Apply to join |
| `/contact` | Contact page |
| `/login` | Member login |
| `/dashboard` | Member dashboard |
| `/dashboard/profile` | Profile editor |
| `/dashboard/scorecard` | Founder scorecard |
| `/admin` | Admin overview |
| `/admin/founders` | Admin founder management |

### Design System

**Brand Colors:**
- Navy: `#0A1628` — primary backgrounds, headers
- Gold: `#C9A84C` — accents, CTAs, highlights
- Cream: `#F8F5EF` — section backgrounds

---

## Backend

### Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure database in .env (PostgreSQL recommended)
php artisan migrate
php artisan db:seed   # Seeds demo founders, companies, events, programs, partners, sponsors, news

php artisan serve     # API at http://localhost:8000
```

### API Endpoints (Base: `/api/v1`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/founders` | List founders |
| GET | `/companies` | List companies |
| GET | `/events` | List events |
| GET | `/programs` | List programs |
| GET | `/partners` | List partners |
| GET | `/sponsors` | List sponsors |
| GET | `/news` | List news items |
| POST | `/applications` | Submit membership application |
| POST | `/contact` | Submit contact inquiry |

---

## Database Schema

20+ tables covering: users, founder_profiles, company_profiles, applications, scorecards, events, programs, cohorts, matches, intros, appointments, partner_profiles, sponsor_profiles, news_items, resources, messages, analytics_events, admin_actions.

---

## Implementation Roadmap

### Phase 1 (Complete ✅)
- [x] Repository structure and architecture
- [x] Design system (Tailwind + component library)
- [x] All public website pages
- [x] Member dashboard shell
- [x] Admin dashboard shell
- [x] Database migrations (20+ tables)
- [x] Laravel REST API (14 endpoints)
- [x] Seeded demo content

### Phase 2 (Next)
- [ ] Authentication (login, registration, email verification)
- [ ] Founder and company profile CRUD
- [ ] Community feed
- [ ] Match suggestions and warm intros
- [ ] Appointment booking
- [ ] Events RSVP
- [ ] Program applications

### Phase 3 (Future)
- [ ] AI agent service layer (10 agents)
- [ ] Scorecard calculation engine
- [ ] Analytics dashboard
- [ ] Admin content management
- [ ] Email notifications

---

## Trust and Brand Guardrails

- NEVER fabricate quotes from public figures
- NEVER imply official endorsement without verified approval
- Partner status labels: Confirmed / Prospective / Ecosystem-Aligned / Past Collaborator
- Saudi Innovation Leadership section uses CMS-editable placeholder blocks

---

## License

Copyright © 2024 Wosool. All rights reserved.

