# Wosool — Deployment Guide

## Prerequisites

- Node.js 20+
- PHP 8.3+
- Composer 2+
- PostgreSQL 15+
- Redis (for cache/queue)

## Frontend Deployment

```bash
cd frontend
npm ci
npm run build
npm run start   # Starts Next.js production server
```

Environment variables (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=https://wosool.org/api/v1
```

## Backend Deployment

```bash
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

## Environment Configuration

All secrets and configuration are managed via `.env` files. **Never commit `.env` files.**

### Required Backend Environment Variables

| Variable | Description |
|----------|-------------|
| `APP_KEY` | Application encryption key |
| `APP_ENV` | `production` or `local` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | Database host |
| `DB_DATABASE` | Database name |
| `DB_USERNAME` | Database user |
| `DB_PASSWORD` | Database password |
| `REDIS_HOST` | Redis host |

## CI/CD

- Node 20 is the target runtime
- Frontend validation: `npm run lint && npm run build`
- Backend validation: `composer test`
- Backend linting: `vendor/bin/pint`

## Domain Configuration

| Domain | Purpose |
|--------|---------|
| `wosool.org` | Primary domain |

### SSL/TLS

See [SSL_RUNBOOK.md](./SSL_RUNBOOK.md) for certificate management details.

## Health Checks

- Frontend: HTTP GET `/` → 200
- Backend API: HTTP GET `/api/v1` → 200
