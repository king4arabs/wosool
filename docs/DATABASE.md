# Database

## Platform assumptions

- Primary relational database: PostgreSQL
- Laravel default support files also include cache/jobs/session tables
- The README references `pgvector` for future AI-oriented features

## Core domain entities

The current migration and model set covers:

- users
- founder profiles
- company profiles
- founder/company links
- applications
- scorecards and scorecard metrics
- events
- programs and cohorts
- matches
- appointments
- partners
- sponsors
- news/content records
- messages and notifications

## Seeded demo content

`backend/database/seeders/WosoolSeeder.php` seeds representative:

- founders and companies
- events
- programs
- partners
- sponsors
- news items
- scorecards

## Local setup

```bash
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

For CI and local tests, ensure the application key is generated before running the test suite.
