# Wosool — Database Schema

## Engine

**PostgreSQL** with **pgvector** extension (for future AI features).

## Schema Overview

20+ tables covering the full Wosool platform:

| Table | Purpose |
|-------|---------|
| `users` | Authentication and account data |
| `founder_profiles` | Founder details, bio, skills |
| `company_profiles` | Company information |
| `applications` | Membership applications |
| `scorecards` | Founder scorecards and ratings |
| `events` | Community events |
| `programs` | Programs and accelerators |
| `cohorts` | Program cohorts |
| `matches` | Founder-to-founder matches |
| `intros` | Warm introduction requests |
| `appointments` | Scheduled meetings |
| `partner_profiles` | Partner organizations |
| `sponsor_profiles` | Sponsors |
| `news_items` | News and announcements |
| `resources` | Shared resources |
| `messages` | Internal messaging |
| `analytics_events` | Usage analytics |
| `admin_actions` | Admin audit log |

## Migrations

All migrations are in `backend/database/migrations/`.

```bash
cd backend
php artisan migrate          # Run migrations
php artisan migrate:rollback # Rollback last batch
php artisan migrate:fresh    # Drop all and re-migrate (dev only)
```

## Seeders

Demo data is seeded via:

```bash
cd backend
php artisan db:seed
```

Seeders cover: founders, companies, events, programs, partners, sponsors, news items.

## Connection

Configure database connection in `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=wosool
DB_USERNAME=wosool
DB_PASSWORD=your_password
```
