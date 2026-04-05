# Deployment

## Frontend

Requirements:

- Node 20 compatible runtime

Commands:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

The frontend is a Next.js 16 application with public marketing routes and dashboard shells; deploy it as a standard Next app unless you intentionally introduce a static export workflow.

## Backend

Requirements:

- PHP 8.3+
- Composer

Commands:

```bash
cd backend
composer install --no-interaction --prefer-dist
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan test
```

## CI notes

- Backend GitHub Actions already copies `.env.example`, generates an app key, and runs `php artisan test`
- Local backend test failures caused by a missing `APP_KEY` are environment bootstrapping issues, not necessarily application regressions

## SSL note

Domain certificate repair depends on DNS/proxy state and valid Cloudflare credentials. Use the guarded workflow in [SSL_RUNBOOK.md](./SSL_RUNBOOK.md).
