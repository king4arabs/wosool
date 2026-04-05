# Wosool — Architecture

## Overview

Wosool is a monorepo containing a **Next.js frontend** and a **Laravel backend API**.

```
wosool/
├── frontend/          # Next.js 16 + TypeScript + Tailwind CSS v4
├── backend/           # Laravel 12 + PHP 8.3 RESTful API
├── docs/              # Project documentation
├── scripts/           # Operational scripts
└── README.md
```

## Frontend

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-based config) |
| Components | shadcn/ui + Radix UI primitives |
| Icons | Lucide React |

- Entry point: `frontend/src/app/`
- Component library: `frontend/src/components/ui/`
- Utilities: `frontend/src/lib/utils.ts`
- Build: `cd frontend && npm run build`
- Lint: `cd frontend && npm run lint`
- Dev server: `cd frontend && npm run dev` → http://localhost:3000

## Backend

| Component | Technology |
|-----------|-----------|
| Framework | Laravel 12 |
| Language | PHP 8.3 |
| Database | PostgreSQL (+ pgvector for AI features) |
| Cache/Queue | Redis |
| Auth | Laravel Sanctum |
| Permissions | spatie/laravel-permission |
| Asset build | Vite 8 |

- API base: `/api/v1`
- Routes: `backend/routes/api.php`
- Models: `backend/app/Models/`
- Migrations: `backend/database/migrations/`
- Seeds: `backend/database/seeders/`
- Build: `cd backend && composer install && npm install && npm run build`
- Dev server: `cd backend && php artisan serve` → http://localhost:8000

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#0A1628` | Primary backgrounds, headers |
| Gold | `#C9A84C` | Accents, CTAs, highlights |
| Cream | `#F8F5EF` | Section backgrounds |

## Data Flow

```
Browser → Next.js (SSR/CSR) → Laravel API → PostgreSQL
                                   ↓
                                 Redis (cache/queue)
```

## Key Conventions

- shadcn/ui components use `forwardRef`, `displayName`, and `cn()` from `@/lib/utils`
- Class Variance Authority (CVA) for component variant styling
- Tailwind CSS v4 uses CSS-based configuration via `@theme` directive in `globals.css`
- System fonts only (no Google Fonts dependency)
