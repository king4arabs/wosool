# Deployment

> Wosool deployment guide and environment configuration.

---

## Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | `localhost:3000` (frontend), `localhost:8000` (backend) |
| Staging | Pre-production testing | TBD |
| Production | Live platform | [wosool.org](https://wosool.org) |

---

## Local Development Setup

### Prerequisites

- Node.js 20+ and npm 10+
- PHP 8.3+ and Composer 2+
- PostgreSQL 16+
- Redis 7+

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure .env with database credentials
php artisan migrate
php artisan db:seed    # Load demo data

php artisan serve      # http://localhost:8000
```

### Environment Variables

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Backend (`backend/.env`)

```env
APP_NAME=Wosool
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=wosool
DB_USERNAME=postgres
DB_PASSWORD=

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=database

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

## Production Deployment

### Recommended Stack

| Component | Service | Alternative |
|-----------|---------|-------------|
| Frontend hosting | Vercel | Netlify, AWS Amplify |
| Backend hosting | Railway | Render, AWS EC2 |
| Database | Supabase PostgreSQL | AWS RDS, Railway |
| Cache/Queue | Upstash Redis | AWS ElastiCache |
| Storage | Supabase Storage | AWS S3, Cloudflare R2 |
| CDN | Cloudflare | AWS CloudFront |
| DNS | Cloudflare | AWS Route53 |
| SSL | Cloudflare (auto) | Let's Encrypt |
| Monitoring | Sentry | Datadog, New Relic |

### Frontend (Vercel)

1. Connect repository to Vercel
2. Set root directory to `frontend/`
3. Framework preset: Next.js
4. Set environment variables
5. Deploy

### Backend (Railway)

1. Connect repository to Railway
2. Set root directory to `backend/`
3. Use Nixpacks (auto-detects PHP/Laravel)
4. Add PostgreSQL and Redis plugins
5. Set environment variables
6. Run migrations: `php artisan migrate --force`

### Production Environment Variables

```env
# Backend production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.wosool.org

# Frontend production
NEXT_PUBLIC_API_URL=https://api.wosool.org/api/v1
NEXT_PUBLIC_SITE_URL=https://wosool.org
```

---

## Build Commands

| Component | Command | Notes |
|-----------|---------|-------|
| Frontend build | `cd frontend && npm run build` | Next.js 16 with Turbopack |
| Frontend lint | `cd frontend && npm run lint` | ESLint |
| Backend test | `cd backend && php artisan test` | PHPUnit |
| Backend lint | `cd backend && ./vendor/bin/pint` | Laravel Pint (PSR-12) |
| Migrations | `cd backend && php artisan migrate` | Run on deploy |
| Seeders | `cd backend && php artisan db:seed` | Development only |

---

## CI/CD Pipeline (Planned)

```yaml
# .github/workflows/ci.yml (to be created)
on: [push, pull_request]

jobs:
  frontend:
    - npm ci
    - npm run lint
    - npm run build

  backend:
    - composer install
    - php artisan test

  deploy:
    - Deploy frontend to Vercel
    - Deploy backend to Railway
```

---

## SSL/TLS

- Primary SSL via Cloudflare (Full Strict mode)
- SSL repair script: `npm run ops:ssl:repair` (see [scripts/ssl-repair.mjs](./scripts/ssl-repair.mjs))
- Full operational runbook: [docs/SSL_RUNBOOK.md](./docs/SSL_RUNBOOK.md)
- Certificate monitoring via UptimeRobot (recommended)

---

## Domain Configuration

| Domain | Purpose | Provider |
|--------|---------|----------|
| wosool.org | Frontend (production) | Cloudflare DNS |
| api.wosool.org | Backend API | Cloudflare DNS |

---

## Rollback Procedures

1. **Frontend:** Revert to previous Vercel deployment via dashboard
2. **Backend:** Roll back migration with `php artisan migrate:rollback`
3. **Database:** Restore from latest backup
4. **Emergency:** Switch DNS to maintenance page
