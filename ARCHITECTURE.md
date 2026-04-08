# Architecture

> Wosool system architecture reference.

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Web Browser  │  │  Mobile  │  │  Admin Panel │  │
│  └──────┬───────┘  └────┬─────┘  └──────┬───────┘  │
└─────────┼───────────────┼───────────────┼───────────┘
          │               │               │
┌─────────▼───────────────▼───────────────▼───────────┐
│                   Frontend (Next.js 16)              │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐ │
│  │  Pages  │ │Components│ │  Layouts  │ │  API   │ │
│  │ (35)    │ │(shadcn)  │ │ (Public/  │ │ Client │ │
│  │         │ │          │ │  Member/  │ │        │ │
│  │         │ │          │ │  Admin)   │ │        │ │
│  └─────────┘ └──────────┘ └───────────┘ └────┬───┘ │
└──────────────────────────────────────────────┼──────┘
                                               │
                                          REST API
                                               │
┌──────────────────────────────────────────────▼──────┐
│                  Backend (Laravel 13)                │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────┐ │
│  │Controllers│ │  Models  │ │ Middleware│ │Routes│ │
│  │ (10 API) │ │  (21)    │ │ (Auth/    │ │(API  │ │
│  │          │ │          │ │  CORS)    │ │ v1)  │ │
│  └──────────┘ └──────────┘ └───────────┘ └──────┘ │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐          │
│  │ Services │ │Factories │ │  Seeders  │          │
│  │ (planned)│ │ (User)   │ │ (Wosool)  │          │
│  └──────────┘ └──────────┘ └───────────┘          │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
┌─────────▼──┐ ┌──────▼─────┐ ┌───▼──────────┐
│ PostgreSQL │ │   Redis    │ │   Storage    │
│ (Primary)  │ │ (Cache/    │ │ (S3/Supabase │
│            │ │  Queue)    │ │  planned)    │
└────────────┘ └────────────┘ └──────────────┘
```

---

## Monorepo Structure

```
wosool/
├── frontend/              # Next.js 16 + TypeScript + Tailwind CSS 4
│   ├── src/
│   │   ├── app/           # App Router (35 routes)
│   │   ├── components/    # UI components (layout, sections, ui)
│   │   ├── data/          # Mock/seed data
│   │   ├── lib/           # Utilities (cn, etc.)
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json       # v0.1.0
├── backend/               # Laravel 13 + PHP 8.3
│   ├── app/
│   │   ├── Http/Controllers/Api/  # 10 API controllers
│   │   ├── Models/                # 21 Eloquent models
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/    # 16 migrations
│   │   ├── factories/     # Model factories
│   │   └── seeders/       # Demo data seeders
│   ├── routes/            # API v1 + web routes
│   ├── config/            # 11 configuration files
│   └── composer.json
├── SKILLS/                # Skills reference framework
├── README.md
├── CHANGELOG.md
├── PROJECT_STATUS.md
├── ROADMAP.md
├── ARCHITECTURE.md        # (this file)
└── ...                    # Other docs
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js | 16.2.2 | React framework with App Router |
| Frontend | React | 19.2.4 | UI library |
| Frontend | TypeScript | 5.x | Type safety |
| Frontend | Tailwind CSS | 4.x | Utility-first styling (CSS-based config) |
| Frontend | shadcn/ui | — | Component library (Radix UI primitives) |
| Frontend | Radix UI | — | Accessible UI primitives |
| Frontend | Lucide React | — | Icon library |
| Backend | Laravel | 13.0 | PHP web framework |
| Backend | PHP | 8.3 | Runtime |
| Backend | Sanctum | 4.3 | API token authentication |
| Backend | Spatie Permission | 7.2 | Role-based access control |
| Database | PostgreSQL | 16+ | Primary database (with pgvector) |
| Cache | Redis | 7+ | Caching and queue processing |

---

## API Architecture

### Endpoint Design

- **Base URL:** `/api/v1`
- **Format:** JSON
- **Auth:** Laravel Sanctum (token-based)
- **Versioning:** URL-based (`/api/v1`, `/api/v2`)

### Current Endpoints

| Method | Endpoint | Controller | Auth |
|--------|----------|------------|------|
| GET | `/health` | HealthController | Public |
| GET | `/founders` | FounderController@index | Public |
| GET | `/founders/{slug}` | FounderController@show | Public |
| GET | `/companies` | CompanyController@index | Public |
| GET | `/companies/{slug}` | CompanyController@show | Public |
| GET | `/events` | EventController@index | Public |
| GET | `/events/{slug}` | EventController@show | Public |
| GET | `/programs` | ProgramController@index | Public |
| GET | `/programs/{slug}` | ProgramController@show | Public |
| GET | `/partners` | PartnerController@index | Public |
| GET | `/sponsors` | PartnerController@sponsors | Public |
| GET | `/news` | NewsController@index | Public |
| GET | `/news/{slug}` | NewsController@show | Public |
| GET | `/resources` | ResourceController@index | Public |
| GET | `/resources/{slug}` | ResourceController@show | Public |
| POST | `/applications` | ApplicationController@store | Public |
| POST | `/contact` | ContactController@store | Public |

---

## Data Model

### Core Entities

```
User ──┬── FounderProfile ──── CompanyProfile
       │         │
       │    Application ──── Scorecard ──── ScorecardMetric
       │
       ├── PartnerProfile
       ├── SponsorProfile
       │
       ├── Program ──── Cohort
       ├── Event
       ├── NewsItem
       │
       └── Message / ContactMessage / AnalyticsEvent / AdminAction
```

### Database Tables (20+)

| Category | Tables |
|----------|--------|
| Identity | users, founder_profiles, company_profiles |
| Applications | applications, scorecards, scorecard_metrics |
| Programs | programs, cohorts |
| Community | matches, intros, appointments, appointment_slots |
| Partners | partner_profiles, sponsor_profiles |
| Content | events, news_items, resources |
| Communication | messages, contact_messages |
| System | analytics_events, admin_actions, cache, jobs, sessions |

---

## Design Patterns

| Pattern | Usage |
|---------|-------|
| App Router | Next.js file-based routing with layouts |
| Component composition | shadcn/ui + Radix primitives + CVA variants |
| Repository pattern | Eloquent models with scoped queries |
| API resource pattern | Laravel API controllers returning JSON |
| Slug-based routing | Human-readable URLs for all public content |
| Seeder pattern | WosoolSeeder for consistent demo data |

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Authentication | Laravel Sanctum (API tokens) |
| Authorization | Spatie roles/permissions |
| Input validation | Laravel Form Requests (planned) |
| CORS | Laravel CORS middleware |
| CSRF | Laravel CSRF protection (web routes) |
| SQL injection | Eloquent ORM parameterized queries |
| XSS | React auto-escaping + Laravel Blade escaping |

---

## Conventions

| Convention | Standard |
|------------|----------|
| Frontend naming | kebab-case files, PascalCase components |
| Backend naming | Laravel conventions (PascalCase models, snake_case DB) |
| API responses | `{ data: [...] }` or `{ data: {...} }` |
| Imports | `@/` alias for `frontend/src/` |
| CSS | Tailwind CSS v4 with `@theme` directive in globals.css |
| Component variants | Class Variance Authority (CVA) |
| Utility function | `cn()` from `@/lib/utils` (clsx + tailwind-merge) |
