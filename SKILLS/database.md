# Database Skills

> PostgreSQL, Eloquent ORM, migrations, data modeling

---

## Current Stack

| Technology | Purpose | Status |
|-----------|---------|--------|
| PostgreSQL 16+ | Primary database | Configured |
| pgvector | AI embedding storage | Planned |
| Redis 7+ | Cache and queue | Configured |
| Eloquent ORM | Database abstraction | Active |

---

## Schema Overview

### Tables (20+)

| Category | Tables | Count |
|----------|--------|-------|
| Identity | users, founder_profiles, company_profiles, founder_company_links | 4 |
| Applications | applications, scorecards, scorecard_metrics | 3 |
| Programs | programs, cohorts | 2 |
| Community | matches, intros, appointments, appointment_slots | 4 |
| Partners | partner_profiles, sponsor_profiles | 2 |
| Content | events, news_items, resources | 3 |
| Communication | messages, contact_messages | 2 |
| System | analytics_events, admin_actions, cache, jobs, sessions, failed_jobs | 6 |

### Entity Relationships

```
User (1) ─── (1) FounderProfile
User (1) ─── (1) PartnerProfile
User (1) ─── (1) SponsorProfile

FounderProfile (M) ─── (M) CompanyProfile  [via founder_company_links]
FounderProfile (1) ─── (M) Application
Application    (1) ─── (1) Scorecard
Scorecard      (1) ─── (M) ScorecardMetric

Program  (1) ─── (M) Cohort
```

---

## Conventions

### Naming
- **Tables:** plural snake_case (`founder_profiles`)
- **Columns:** snake_case (`first_name`, `created_at`)
- **Foreign keys:** `{model}_id` (`user_id`, `program_id`)
- **Pivot tables:** alphabetical singular (`founder_company_links`)
- **Timestamps:** `created_at`, `updated_at` (auto-managed)

### Migrations
- Prefix with timestamp: `2024_01_01_000010_create_founder_profiles_table.php`
- Use incremental numbering for ordering
- Include up() and down() methods
- Never modify existing migrations in production

### Indexes
- Primary keys: auto-increment `id`
- Foreign keys: indexed automatically
- Add indexes for frequently queried columns
- Unique indexes for slugs, emails

---

## Operations

```bash
cd backend

# Migration commands
php artisan migrate                  # Run pending
php artisan migrate:rollback         # Rollback last batch
php artisan migrate:fresh --seed     # Fresh DB with seeds
php artisan migrate:status           # Check status

# Seeding
php artisan db:seed                  # Run all seeders
php artisan db:seed --class=WosoolSeeder  # Specific seeder

# Database utilities
php artisan tinker                   # Interactive REPL
php artisan model:show User          # Show model schema
```

---

## Checklist

### Schema Quality
- [x] Normalized schema design
- [x] Foreign key constraints
- [x] Timestamp columns on all tables
- [ ] Soft deletes on key models
- [ ] Database indexes audit
- [ ] Column type optimization

### Data Integrity
- [x] Foreign key relationships
- [ ] Unique constraints (email, slug)
- [ ] Check constraints (status values)
- [ ] Default values defined
- [ ] NOT NULL on required columns

### Performance
- [ ] Query performance profiling
- [ ] N+1 query detection
- [ ] Eager loading relationships
- [ ] Database connection pooling
- [ ] Read replica setup
- [ ] Query caching strategy

### Backup & Recovery
- [ ] Automated daily backups
- [ ] Point-in-time recovery
- [ ] Backup testing (monthly restore)
- [ ] Data retention policy

---

## Recommended Tools

| Tool | Purpose |
|------|---------|
| Laravel Debugbar | Query profiling in development |
| pgAdmin | PostgreSQL GUI management |
| Laravel Telescope | Request/query monitoring |
| pg_dump | Backup generation |
| PgBouncer | Connection pooling (production) |
